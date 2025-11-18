/**
 * Detect News Spam Use Case
 *
 * Haber içeriğinde spam tespiti
 */

import { Result } from '@/6-core/result/Result';
import { IAIRouter } from '@/3-domain/interfaces/services/IAIRouter';
import { IPromptManager } from '@/3-domain/interfaces/services/IPromptManager';
import { ITokenTracker } from '@/3-domain/interfaces/services/ITokenTracker';
import { INewsRepository } from '@/3-domain/interfaces/repositories/INewsRepository';
import { AIUseCase } from '@/3-domain/enums/AIEnums';
import { logger } from '@/5-shared/utils/logger';
import { AppError } from '@/6-core/errors/AppError';

export interface DetectNewsSpamDto {
  newsId?: string;
  title?: string;
  content?: string;
  summary?: string;
  authorId?: string;
  authorEmail?: string;
}

export interface NewsSpamDetectionResult {
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

export class DetectNewsSpamUseCase {
  constructor(
    private newsRepository: INewsRepository,
    private aiRouter: IAIRouter,
    private promptManager: IPromptManager,
    private tokenTracker: ITokenTracker
  ) {}

  async execute(dto: DetectNewsSpamDto): Promise<Result<NewsSpamDetectionResult>> {
    try {
      // 1. İçeriği al (newsId varsa)
      let title = dto.title || '';
      let content = dto.content || '';
      let summary = dto.summary || '';

      if (dto.newsId) {
        const newsResult = await this.newsRepository.findById(dto.newsId);
        if (newsResult.isFailure || !newsResult.value) {
          return Result.fail(new AppError('Haber bulunamadı', 404));
        }

        const news = newsResult.value;
        title = news.title;
        content = news.content;
        summary = news.summary || '';
      }

      if (!title && !content) {
        return Result.fail(new AppError('Başlık veya içerik gereklidir', 400));
      }

      // 2. Prompt template'i al (forum_moderation kullanıyoruz ama news için özelleştirilmiş)
      const promptResult = await this.promptManager.getActivePrompt(AIUseCase.FORUM_MODERATION);
      if (promptResult.isFailure || !promptResult.value) {
        return Result.fail(
          new AppError('Prompt template bulunamadı. Lütfen admin panelinden prompt oluşturun.', 404)
        );
      }

      const prompt = promptResult.value;

      // 3. Prompt'u render et (news spam detection için özelleştirilmiş)
      const newsSpamPrompt = `Sen bir haber moderasyon uzmanısın. Aşağıdaki haber içeriğini analiz edip spam olup olmadığını tespit et.

**Haber Başlığı:**
${title}

**Haber Özeti:**
${summary || 'Yok'}

**Haber İçeriği:**
${content}

**Yazar Bilgisi:**
Kullanıcı ID: ${dto.authorId || 'Bilinmiyor'}
E-posta: ${dto.authorEmail || ''}

**Spam Kriterleri (Haber İçin):**
1. Clickbait başlıklar (yanıltıcı, abartılı)
2. Promosyon içeriği (ürün/hizmet satışı)
3. Tekrarlayan içerik (aynı metnin tekrarı)
4. Uygunsuz dil (küfür, hakaret)
5. Otomatik içerik (bot benzeri)
6. İstenmeyen reklamlar
7. SEO spam (aşırı anahtar kelime kullanımı)
8. Link spam (çok fazla dış link)

**Görev:**
1. İçeriği analiz et
2. Spam skoru belirle (0-100)
3. Spam faktörlerini listele
4. Öneri ver (approve/reject/review)

**Çıktı Formatı (JSON):**
{
  "spamScore": 0-100 arası spam skoru,
  "isSpam": true/false,
  "reason": "Spam nedeni (eğer spam ise)",
  "recommendation": "approve|reject|review",
  "factors": [
    {
      "name": "Faktör adı (örn: Clickbait Başlık)",
      "score": 0-100 arası skor,
      "description": "Açıklama"
    }
  ]
}

**Öneri Kuralları:**
- spamScore < 40: approve (otomatik onayla)
- spamScore >= 70: reject (otomatik reddet)
- 40 <= spamScore < 70: review (admin onayı gerekli)

Lütfen yalnızca JSON formatında yanıt ver.`;

      // 4. AI'a gönder
      const aiResult = await this.aiRouter.complete(AIUseCase.FORUM_MODERATION, newsSpamPrompt, {
        metadata: {
          model: prompt.model,
          temperature: prompt.temperature,
          maxTokens: prompt.maxTokens,
        },
      });

      if (aiResult.isFailure) {
        logger.error('AI news spam detection failed:', aiResult.error);
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

      let spamResult: NewsSpamDetectionResult;

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

      logger.info('News spam detection completed', {
        newsId: dto.newsId,
        spamScore: spamResult.spamScore,
        recommendation: spamResult.recommendation,
      });

      return Result.ok(spamResult);
    } catch (error) {
      logger.error('Error in DetectNewsSpamUseCase:', error);
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Spam tespiti sırasında bir hata oluştu',
          500
        )
      );
    }
  }
}
