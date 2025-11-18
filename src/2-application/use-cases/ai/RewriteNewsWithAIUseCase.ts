/**
 * Rewrite News With AI Use Case
 *
 * RSS feed item'ını AI ile yeniden yazma
 */

import { Result } from '@/6-core/result/Result';
import { IAIRouter } from '@/3-domain/interfaces/services/IAIRouter';
import { IPromptManager } from '@/3-domain/interfaces/services/IPromptManager';
import { ITokenTracker } from '@/3-domain/interfaces/services/ITokenTracker';
import { IRSSFeedRepository } from '@/3-domain/interfaces/repositories/IRSSFeedRepository';
import { RSSFeedItem } from '@/3-domain/entities/RSSFeed';
import { AIUseCase, AIRequestStatus } from '@/3-domain/enums/AIEnums';
import { logger } from '@/5-shared/utils/logger';
import { AppError } from '@/6-core/errors/AppError';

export interface RewriteNewsDto {
  feedItemId: string;
  targetCategory?: string;
  targetProgramId?: string;
  language?: 'tr' | 'en';
}

export interface RewrittenNews {
  title: string;
  summary: string;
  content: string;
  metaDescription: string;
  metaKeywords: string[];
  category: string;
}

export class RewriteNewsWithAIUseCase {
  constructor(
    private rssFeedRepository: IRSSFeedRepository,
    private aiRouter: IAIRouter,
    private promptManager: IPromptManager,
    private tokenTracker: ITokenTracker
  ) {}

  async execute(dto: RewriteNewsDto): Promise<Result<RewrittenNews>> {
    try {
      // 1. Feed item'ı bul
      const feedItemResult = await this.rssFeedRepository.findFeedItemById(dto.feedItemId);
      if (feedItemResult.isFailure) {
        return Result.fail(new AppError('Feed item bulunamadı', 404));
      }

      const feedItem = feedItemResult.value;
      if (!feedItem) {
        return Result.fail(new AppError('Feed item bulunamadı', 404));
      }

      // 2. Prompt template'i al
      const promptResult = await this.promptManager.getActivePrompt(AIUseCase.NEWS_REWRITE);
      if (promptResult.isFailure || !promptResult.value) {
        return Result.fail(
          new AppError('Prompt template bulunamadı. Lütfen admin panelinden prompt oluşturun.', 404)
        );
      }

      const prompt = promptResult.value;

      // 3. Prompt'u render et
      const renderedPrompt = this.promptManager.renderPrompt(prompt, {
        title: feedItem.title,
        description: feedItem.description || '',
        content: feedItem.content || feedItem.description || '',
        link: feedItem.link,
        author: feedItem.author || 'Bilinmiyor',
        pubDate: feedItem.pubDate ? feedItem.pubDate.toISOString() : '',
        category: dto.targetCategory || feedItem.categories[0] || 'GENEL',
        language: dto.language || 'tr',
      });

      // 4. AI'a gönder
      const aiResult = await this.aiRouter.complete(AIUseCase.NEWS_REWRITE, renderedPrompt, {
        metadata: {
          model: prompt.model,
          temperature: prompt.temperature,
          maxTokens: prompt.maxTokens,
        },
      });

      if (aiResult.isFailure) {
        logger.error('AI rewrite failed:', aiResult.error);
        return Result.fail(
          new AppError(`AI rewrite başarısız: ${aiResult.error?.message || 'Bilinmeyen hata'}`, 500)
        );
      }

      // 5. AI response'u parse et
      const aiResponse = aiResult.value;
      const responseText =
        typeof aiResponse === 'string'
          ? aiResponse
          : (aiResponse as any)?.text || JSON.stringify(aiResponse);

      let rewrittenNews: RewrittenNews;

      try {
        // JSON formatında dönüyor mu kontrol et
        const parsed = JSON.parse(responseText);
        rewrittenNews = {
          title: parsed.title || feedItem.title,
          summary: parsed.summary || parsed.description || '',
          content: parsed.content || parsed.body || '',
          metaDescription: parsed.metaDescription || parsed.summary?.substring(0, 160) || '',
          metaKeywords: parsed.metaKeywords || parsed.tags || feedItem.categories || [],
          category: parsed.category || dto.targetCategory || feedItem.categories[0] || 'GENEL',
        };
      } catch {
        // JSON değilse, text olarak parse et
        const lines = responseText.split('\n');
        const titleMatch = responseText.match(/Başlık[:\s]+(.+)/i) || lines[0];
        const summaryMatch = responseText.match(/Özet[:\s]+(.+)/i);
        const contentMatch = responseText.match(/İçerik[:\s]+([\s\S]+)/i);

        rewrittenNews = {
          title: titleMatch
            ? Array.isArray(titleMatch)
              ? titleMatch[1]
              : titleMatch
            : feedItem.title,
          summary: summaryMatch ? summaryMatch[1] : responseText.substring(0, 500),
          content: contentMatch ? contentMatch[1] : responseText,
          metaDescription: responseText.substring(0, 160),
          metaKeywords: feedItem.categories || [],
          category: dto.targetCategory || feedItem.categories[0] || 'GENEL',
        };
      }

      // 6. Token tracking
      if (aiResponse.totalTokens) {
        await this.tokenTracker.logUsage({
          provider: aiResponse.provider,
          model: prompt.model,
          useCase: AIUseCase.NEWS_REWRITE,
          userId: null,
          companyId: null,
          programId: dto.targetProgramId || null,
          promptId: prompt.id,
          promptVersion: prompt.version,
          requestText: renderedPrompt,
          responseText: responseText,
          requestTokens: aiResponse.requestTokens || 0,
          responseTokens: aiResponse.responseTokens || 0,
          totalTokens: aiResponse.totalTokens,
          costUsd: aiResponse.costUsd || 0,
          status: AIRequestStatus.SUCCESS,
          errorMessage: null,
          errorCode: null,
          durationMs: null,
          metadata: null,
        });
      }

      logger.info('News rewritten successfully', {
        feedItemId: dto.feedItemId,
        title: rewrittenNews.title,
      });

      return Result.ok(rewrittenNews);
    } catch (error) {
      logger.error('Error in RewriteNewsWithAIUseCase:', error);
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Haber yeniden yazma sırasında bir hata oluştu',
          500
        )
      );
    }
  }
}
