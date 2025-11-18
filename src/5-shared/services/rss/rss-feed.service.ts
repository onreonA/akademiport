/**
 * RSS Feed Service
 *
 * RSS feed parsing ve scraping servisi
 */

// @ts-ignore - rss-parser doesn't have types
import Parser from 'rss-parser';
import { logger } from '@/5-shared/utils/logger';
import { RSSFeedItem } from '@/3-domain/entities/RSSFeed';

export interface RSSFeedParseResult {
  items: RSSFeedItemData[];
  feedTitle?: string;
  feedDescription?: string;
  feedLink?: string;
}

export interface RSSFeedItemData {
  title: string;
  link: string;
  description?: string;
  content?: string;
  author?: string;
  pubDate?: Date;
  guid?: string;
  imageUrl?: string;
  categories?: string[];
}

export class RSSFeedService {
  private parser: Parser;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  constructor() {
    this.parser = new Parser({
      timeout: 30000, // 30 seconds
      customFields: {
        item: [
          ['content:encoded', 'content'],
          ['media:content', 'mediaContent'],
          ['media:thumbnail', 'mediaThumbnail'],
        ],
      },
    });
  }

  /**
   * RSS feed'i parse et
   */
  async parseFeed(feedUrl: string): Promise<RSSFeedParseResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        logger.info(`Parsing RSS feed: ${feedUrl} (attempt ${attempt}/${this.maxRetries})`);

        const feed = await this.parser.parseURL(feedUrl);

        const items: RSSFeedItemData[] = (feed.items || []).map((item) => {
          // Extract image URL from various sources
          let imageUrl: string | undefined;
          if (item.enclosure?.type?.startsWith('image/')) {
            imageUrl = item.enclosure.url;
          } else if (item['media:content']?.$?.url) {
            imageUrl = item['media:content'].$.url;
          } else if (item['media:thumbnail']?.$?.url) {
            imageUrl = item['media:thumbnail'].$.url;
          } else if (item.contentSnippet) {
            // Try to extract image from HTML content
            const imgMatch = item.contentSnippet.match(/<img[^>]+src="([^"]+)"/i);
            if (imgMatch) {
              imageUrl = imgMatch[1];
            }
          }

          return {
            title: item.title || 'Untitled',
            link: item.link || '',
            description: item.contentSnippet || item.description || undefined,
            content: item['content:encoded'] || item.content || item.contentSnippet || undefined,
            author: item.creator || item.author || undefined,
            pubDate: item.pubDate ? new Date(item.pubDate) : undefined,
            guid: item.guid || item.id || item.link || undefined,
            imageUrl,
            categories: item.categories || [],
          };
        });

        logger.info(`Successfully parsed RSS feed: ${feedUrl} (${items.length} items)`);

        return {
          items,
          feedTitle: feed.title,
          feedDescription: feed.description,
          feedLink: feed.link,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.warn(
          `Failed to parse RSS feed (attempt ${attempt}/${this.maxRetries}): ${feedUrl}`,
          {
            error: lastError.message,
          }
        );

        if (attempt < this.maxRetries) {
          // Wait before retry
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    throw new Error(
      `Failed to parse RSS feed after ${this.maxRetries} attempts: ${lastError?.message}`
    );
  }

  /**
   * RSS feed URL'i doğrula
   */
  async validateFeedUrl(feedUrl: string): Promise<boolean> {
    try {
      const result = await this.parseFeed(feedUrl);
      return result.items.length >= 0; // At least should parse successfully
    } catch {
      return false;
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
