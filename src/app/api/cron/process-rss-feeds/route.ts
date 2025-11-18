/**
 * Cron Job: Process RSS Feeds
 *
 * Her 6 saatte bir çalışır ve aktif RSS feed'leri kontrol eder
 * Yeni item'ları bulur ve veritabanına kaydeder
 * Otomatik yayınlama aktifse AI rewrite yapar ve haber oluşturur
 *
 * GET /api/cron/process-rss-feeds
 * Authorization: Cron secret key (header: x-cron-secret)
 */

import { NextRequest, NextResponse } from 'next/server';
import { SupabaseRSSFeedRepository } from '@/4-infrastructure/database/repositories/SupabaseRSSFeedRepository';
import { RSSFeedService } from '@/5-shared/services/rss/rss-feed.service';
import { RewriteNewsWithAIUseCase } from '@/2-application/use-cases/ai/RewriteNewsWithAIUseCase';
import { AIRouterService } from '@/5-shared/services/ai/ai-router.service';
import { PromptManagerService } from '@/5-shared/services/ai/prompt-manager.service';
import { TokenTrackerService } from '@/5-shared/services/ai/token-tracker.service';
import { SupabaseNewsRepository } from '@/4-infrastructure/database/repositories/SupabaseNewsRepository';
import { NewsStatus, NewsCategory } from '@/3-domain/enums/NewsEnums';
import { logger } from '@/5-shared/utils/logger';
import { Result } from '@/6-core/result/Result';
import { RSSFeedEntity } from '@/3-domain/entities/RSSFeed';

export async function GET(request: NextRequest) {
  try {
    // Cron secret kontrolü
    const cronSecret = request.headers.get('x-cron-secret');
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || cronSecret !== expectedSecret) {
      logger.warn('Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('RSS feed processing cron job started');

    const rssFeedRepository = new SupabaseRSSFeedRepository();
    const rssFeedService = new RSSFeedService();
    const newsRepository = new SupabaseNewsRepository();

    // AI services (sadece otomatik yayınlama için gerekli)
    const aiRouter = new AIRouterService();
    const promptManager = new PromptManagerService();
    const tokenTracker = new TokenTrackerService();
    const rewriteUseCase = new RewriteNewsWithAIUseCase(
      rssFeedRepository,
      aiRouter,
      promptManager,
      tokenTracker
    );

    // Kontrol edilmesi gereken feed'leri bul
    const feedsToCheckResult = await rssFeedRepository.findFeedsToCheck();
    if (feedsToCheckResult.isFailure) {
      logger.error('Failed to find feeds to check:', feedsToCheckResult.error);
      return NextResponse.json({ error: 'Failed to find feeds to check' }, { status: 500 });
    }

    const feedsToCheck = feedsToCheckResult.value;
    logger.info(`Found ${feedsToCheck.length} feeds to check`);

    const results = {
      totalFeeds: feedsToCheck.length,
      processedFeeds: 0,
      newItems: 0,
      errorCount: 0,
      autoPublished: 0,
      errors: [] as string[],
    };

    // Her feed'i işle
    for (const feed of feedsToCheck) {
      try {
        logger.info(`Processing feed: ${feed.name} (${feed.feedUrl})`);

        // RSS feed'i parse et
        const parseResult = await rssFeedService.parseFeed(feed.feedUrl);

        // Yeni item'ları bul ve kaydet
        let newItemsCount = 0;
        for (const item of parseResult.items) {
          // GUID ile kontrol et (duplicate kontrolü)
          if (item.guid) {
            const existingItemResult = await rssFeedRepository.findFeedItemByGuid(item.guid);
            if (existingItemResult.isSuccess && existingItemResult.value) {
              // Zaten var, atla
              continue;
            }
          }

          // Yeni item'ı kaydet
          const createItemResult = await rssFeedRepository.createFeedItem({
            feedId: feed.id,
            title: item.title,
            link: item.link,
            description: item.description || null,
            content: item.content || null,
            author: item.author || null,
            pubDate: item.pubDate || null,
            guid: item.guid || null,
            imageUrl: item.imageUrl || null,
            categories: item.categories || [],
            isProcessed: false,
            processedAt: null,
            newsId: null,
          });

          if (createItemResult.isSuccess) {
            newItemsCount++;
            results.newItems++;

            // Otomatik yayınlama aktifse AI rewrite yap ve haber oluştur
            if (feed.autoPublish && createItemResult.value) {
              try {
                await processAutoPublish(
                  createItemResult.value,
                  feed,
                  rewriteUseCase,
                  newsRepository,
                  rssFeedRepository
                );
                results.autoPublished++;
              } catch (error) {
                logger.error(`Failed to auto-publish item ${createItemResult.value.id}:`, error);
                results.errors.push(`Auto-publish failed for item ${createItemResult.value.id}`);
              }
            }
          }
        }

        // Feed'i başarılı olarak işaretle
        const feedEntity = new RSSFeedEntity(feed);
        feedEntity.recordSuccess();
        await rssFeedRepository.update(feed.id, {
          lastCheckedAt: feedEntity.lastCheckedAt,
          lastError: null,
          errorCount: feedEntity.errorCount,
          successCount: feedEntity.successCount,
        });

        results.processedFeeds++;
        logger.info(`Feed processed: ${feed.name} (${newItemsCount} new items)`);
      } catch (error) {
        logger.error(`Failed to process feed ${feed.name}:`, error);
        results.errorCount++;

        const errorMessage = error instanceof Error ? error.message : String(error);
        results.errors.push(`Feed ${feed.name}: ${errorMessage}`);

        // Feed'e hata kaydet
        const feedEntity = new RSSFeedEntity(feed);
        feedEntity.recordError(errorMessage);
        await rssFeedRepository.update(feed.id, {
          lastCheckedAt: feedEntity.lastCheckedAt,
          lastError: feedEntity.lastError,
          errorCount: feedEntity.errorCount,
          successCount: feedEntity.successCount,
        });
      }
    }

    logger.info('RSS feed processing cron job completed', results);

    return NextResponse.json(
      {
        success: true,
        message: 'RSS feeds processed',
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error in RSS feed processing cron job:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Otomatik yayınlama işlemi
 */
async function processAutoPublish(
  feedItem: { id: string; imageUrl: string | null },
  feed: { id: string; category: string | null; programId: string; createdBy: string | null },
  rewriteUseCase: RewriteNewsWithAIUseCase,
  newsRepository: SupabaseNewsRepository,
  rssFeedRepository: SupabaseRSSFeedRepository
): Promise<void> {
  // AI rewrite yap
  const rewriteResult = await rewriteUseCase.execute({
    feedItemId: feedItem.id,
    targetCategory: feed.category || undefined,
    targetProgramId: feed.programId,
    language: 'tr',
  });

  if (rewriteResult.isFailure) {
    throw new Error(`AI rewrite failed: ${rewriteResult.error?.message}`);
  }

  const rewrittenNews = rewriteResult.value;

  // Slug oluştur
  const slug = rewrittenNews.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Haber oluştur (draft olarak)
  const newsResult = await newsRepository.create({
    programId: feed.programId,
    authorId: feed.createdBy || '00000000-0000-0000-0000-000000000000', // System user
    title: rewrittenNews.title,
    slug: `${slug}-${Date.now()}`, // Unique slug
    summary: rewrittenNews.summary,
    content: rewrittenNews.content,
    category: (rewrittenNews.category as NewsCategory) || NewsCategory.GENERAL,
    status: NewsStatus.DRAFT, // Draft olarak oluştur, admin onaylasın
    imageUrl: feedItem.imageUrl,
    imageAlt: rewrittenNews.title,
    metaDescription: rewrittenNews.metaDescription,
    metaKeywords: rewrittenNews.metaKeywords,
    isFeatured: false,
    isPinned: false,
    readingTime: null,
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    publishedAt: null,
    archivedAt: null,
    createdBy: feed.createdBy,
    updatedBy: feed.createdBy,
  });

  if (newsResult.isFailure) {
    throw new Error(`News creation failed: ${newsResult.error}`);
  }

  // Feed item'ı işlenmiş olarak işaretle
  await rssFeedRepository.markItemAsProcessed(feedItem.id, newsResult.value.id);

  logger.info(`Auto-published news: ${newsResult.value.title} (${newsResult.value.id})`);
}
