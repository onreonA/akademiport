/**
 * Detect Spam Use Case
 *
 * Forum topic veya reply içeriğinde spam tespiti
 */

import { Result } from '@/6-core/result/Result';
import { IAIRouter } from '@/3-domain/interfaces/services/IAIRouter';
import { IPromptManager } from '@/3-domain/interfaces/services/IPromptManager';
import { ITokenTracker } from '@/3-domain/interfaces/services/ITokenTracker';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';
import { AIUseCase } from '@/3-domain/enums/AIEnums';
import { logger } from '@/5-shared/utils/logger';
import { AppError } from '@/6-core/errors/AppError';

export interface DetectSpamDto {
  topicId?: string;
  replyId?: string;
  content: string;
  authorId?: string;
  authorEmail?: string;
}

export interface SpamDetectionResult {
  isSpam: boolean;
  spamScore: number; // 0-100
  spamReason?: string;
  recommendation: 'approve' | 'reject' | 'review'; // approve (<40), reject (>=70), review (40-69)
  factors: Array<{
    name: string;
    score: number;
    description: string;
  }>;
}

export class DetectSpamUseCase {
  constructor(
    private forumRepository: IForumRepository,
    private aiRouter: IAIRouter,
    private promptManager: IPromptManager,
    private tokenTracker: ITokenTracker
  ) {}

  async execute(dto: DetectSpamDto): Promise<Result<SpamDetectionResult>> {
    try {
      // 1. İçeriği al (topic veya reply)
      let content = dto.content;
      let authorInfo = '';

      if (dto.topicId) {
        const topicResult = await this.forumRepository.findTopicById(dto.topicId);
        if (topicResult.isSuccess && topicResult.value) {
          content = topicResult.value.content;
          // Author bilgisi eklenebilir
        }
      } else if (dto.replyId) {
        const replyResult = await this.forumRepository.findReplyById(dto.replyId);
        if (replyResult.isSuccess && replyResult.value) {
          content = replyResult.value.content;
        }
      }

      if (!content || content.trim().length === 0) {
        return Result.fail(new AppError('İçerik bulunamadı', 400));
      }

      // 2. Prompt template'i al
      const promptResult = await this.promptManager.getActivePrompt(AIUseCase.FORUM_MODERATION);
      if (promptResult.isFailure || !promptResult.value) {
        return Result.fail(
          new AppError('Prompt template bulunamadı. Lütfen admin panelinden prompt oluşturun.', 404)
        );
      }

      const prompt = promptResult.value;

      // 3. Prompt'u render et
      const renderedPrompt = this.promptManager.renderPrompt(prompt, {
        content: content,
        authorId: dto.authorId || 'Bilinmiyor',
        authorEmail: dto.authorEmail || '',
        type: dto.topicId ? 'topic' : 'reply',
      });

      // 4. AI'a gönder
      const aiResult = await this.aiRouter.complete(AIUseCase.FORUM_MODERATION, renderedPrompt, {
        metadata: {
          model: prompt.model,
          temperature: prompt.temperature,
          maxTokens: prompt.maxTokens,
        },
      });

      if (aiResult.isFailure) {
        logger.error('AI spam detection failed:', aiResult.error);
        return Result.fail(
          new AppError(
            `Spam tespiti başarısız: ${aiResult.error?.message || 'Bilinmeyen hata'}`,
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

      let spamResult: SpamDetectionResult;

      try {
        // JSON formatında dönüyor mu kontrol et
        const parsed = JSON.parse(responseText);
        const spamScore = parsed.spamScore || parsed.score || 0;

        spamResult = {
          isSpam: spamScore >= 70,
          spamScore: Math.max(0, Math.min(100, spamScore)), // 0-100 arasına sınırla
          spamReason: parsed.reason || parsed.spamReason || undefined,
          recommendation: spamScore < 40 ? 'approve' : spamScore >= 70 ? 'reject' : 'review',
          factors: parsed.factors || parsed.spamFactors || [],
        };
      } catch {
        // JSON değilse, text olarak parse et
        const spamMatch = responseText.match(/spam[:\s]+(\d+)/i);
        const scoreMatch = responseText.match(/(\d+)[\s]*%/i) || spamMatch;

        const spamScore = scoreMatch ? parseInt(scoreMatch[1]) : 50; // Default 50

        spamResult = {
          isSpam: spamScore >= 70,
          spamScore: Math.max(0, Math.min(100, spamScore)),
          spamReason: responseText.substring(0, 200),
          recommendation: spamScore < 40 ? 'approve' : spamScore >= 70 ? 'reject' : 'review',
          factors: [],
        };
      }

      // 6. Token tracking (optional - logUsage is called by AI router)
      // Token tracking is handled by AI router service

      logger.info('Spam detection completed', {
        topicId: dto.topicId,
        replyId: dto.replyId,
        spamScore: spamResult.spamScore,
        recommendation: spamResult.recommendation,
      });

      return Result.ok(spamResult);
    } catch (error) {
      logger.error('Error in DetectSpamUseCase:', error);
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Spam tespiti sırasında bir hata oluştu',
          500
        )
      );
    }
  }
}
