/**
 * Analyze Forum Content Use Case
 *
 * Forum topic veya reply içeriğini analiz eder ve öneriler sunar
 */

import { Result } from '@/6-core/result/Result';
import { IAIRouter } from '@/3-domain/interfaces/services/IAIRouter';
import { IPromptManager } from '@/3-domain/interfaces/services/IPromptManager';
import { ITokenTracker } from '@/3-domain/interfaces/services/ITokenTracker';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';
import { AIUseCase } from '@/3-domain/enums/AIEnums';
import { logger } from '@/5-shared/utils/logger';
import { AppError } from '@/6-core/errors/AppError';

export interface AnalyzeForumContentDto {
  topicId?: string;
  replyId?: string;
  content: string;
  categoryId?: string;
}

export interface ForumContentAnalysis {
  qualityScore: number; // 0-100
  isAppropriate: boolean;
  suggestedCategory?: string;
  improvements: string[];
  strengths: string[];
  weaknesses: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  topicMatch: number; // 0-100 (kategori ile uyum)
}

export class AnalyzeForumContentUseCase {
  constructor(
    private forumRepository: IForumRepository,
    private aiRouter: IAIRouter,
    private promptManager: IPromptManager,
    private tokenTracker: ITokenTracker
  ) {}

  async execute(dto: AnalyzeForumContentDto): Promise<Result<ForumContentAnalysis>> {
    try {
      // 1. İçeriği al (topic veya reply)
      let content = dto.content;
      let categoryId = dto.categoryId;

      if (dto.topicId) {
        const topicResult = await this.forumRepository.findTopicById(dto.topicId);
        if (topicResult.isSuccess && topicResult.value) {
          content = topicResult.value.content;
          // Category bilgisi eklenebilir
        }
      } else if (dto.replyId) {
        const replyResult = await this.forumRepository.findReplyById(dto.replyId);
        if (replyResult.isSuccess && replyResult.value) {
          content = replyResult.value.content;
          // Topic'ten category bilgisi alınabilir
          const topicResult = await this.forumRepository.findTopicById(replyResult.value.topicId);
          if (topicResult.isSuccess && topicResult.value) {
            categoryId = topicResult.value.categoryId;
          }
        }
      }

      if (!content || content.trim().length === 0) {
        return Result.fail(new AppError('İçerik bulunamadı', 400));
      }

      // 2. Prompt template'i al (forum_moderation kullanıyoruz ama farklı bir prompt olabilir)
      const promptResult = await this.promptManager.getActivePrompt(AIUseCase.FORUM_MODERATION);
      if (promptResult.isFailure || !promptResult.value) {
        return Result.fail(
          new AppError('Prompt template bulunamadı. Lütfen admin panelinden prompt oluşturun.', 404)
        );
      }

      const prompt = promptResult.value;

      // 3. Prompt'u render et (content analysis için özelleştirilmiş)
      const analysisPrompt = `Aşağıdaki forum içeriğini analiz et ve detaylı bir analiz raporu oluştur:

**İçerik:**
${content}

**Kategori ID:** ${categoryId || 'Belirtilmemiş'}

**Analiz Kriterleri:**
1. İçerik kalitesi (0-100)
2. Uygunluk (uygun/değil)
3. Kategori uyumu (0-100)
4. Duygu analizi (positive/neutral/negative)
5. Güçlü yönler
6. Zayıf yönler
7. İyileştirme önerileri

**Çıktı Formatı (JSON):**
{
  "qualityScore": 0-100 arası kalite skoru,
  "isAppropriate": true/false,
  "suggestedCategory": "Kategori önerisi (eğer varsa)",
  "improvements": ["İyileştirme önerisi 1", "İyileştirme önerisi 2"],
  "strengths": ["Güçlü yön 1", "Güçlü yön 2"],
  "weaknesses": ["Zayıf yön 1", "Zayıf yön 2"],
  "sentiment": "positive|neutral|negative",
  "topicMatch": 0-100 arası kategori uyumu
}

Lütfen yalnızca JSON formatında yanıt ver.`;

      // 4. AI'a gönder
      const aiResult = await this.aiRouter.complete(AIUseCase.FORUM_MODERATION, analysisPrompt, {
        metadata: {
          model: prompt.model,
          temperature: prompt.temperature,
          maxTokens: prompt.maxTokens,
        },
      });

      if (aiResult.isFailure) {
        logger.error('AI content analysis failed:', aiResult.error);
        return Result.fail(
          new AppError(
            `İçerik analizi başarısız: ${aiResult.error?.message || 'Bilinmeyen hata'}`,
            500
          )
        );
      }

      // 5. AI response'u parse et
      const aiResponse = aiResult.value;
      const responseText =
        typeof aiResponse === 'string'
          ? aiResponse
          : (aiResponse as any)?.text || JSON.stringify(aiResponse);

      let analysis: ForumContentAnalysis;

      try {
        // JSON formatında dönüyor mu kontrol et
        const parsed = JSON.parse(responseText);

        analysis = {
          qualityScore: Math.max(0, Math.min(100, parsed.qualityScore || parsed.quality || 50)),
          isAppropriate: parsed.isAppropriate !== false,
          suggestedCategory: parsed.suggestedCategory || undefined,
          improvements: parsed.improvements || parsed.improvementSuggestions || [],
          strengths: parsed.strengths || parsed.strengthPoints || [],
          weaknesses: parsed.weaknesses || parsed.weakPoints || [],
          sentiment:
            parsed.sentiment === 'positive' || parsed.sentiment === 'negative'
              ? parsed.sentiment
              : 'neutral',
          topicMatch: Math.max(0, Math.min(100, parsed.topicMatch || parsed.categoryMatch || 50)),
        };
      } catch {
        // JSON değilse, default değerler
        analysis = {
          qualityScore: 50,
          isAppropriate: true,
          improvements: [],
          strengths: [],
          weaknesses: [],
          sentiment: 'neutral',
          topicMatch: 50,
        };
      }

      // 6. Token tracking (optional - logUsage is called by AI router)
      // Token tracking is handled by AI router service

      logger.info('Forum content analysis completed', {
        topicId: dto.topicId,
        replyId: dto.replyId,
        qualityScore: analysis.qualityScore,
        isAppropriate: analysis.isAppropriate,
      });

      return Result.ok(analysis);
    } catch (error) {
      logger.error('Error in AnalyzeForumContentUseCase:', error);
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'İçerik analizi sırasında bir hata oluştu',
          500
        )
      );
    }
  }
}
