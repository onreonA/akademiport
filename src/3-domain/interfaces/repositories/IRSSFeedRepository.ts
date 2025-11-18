/**
 * RSS Feed Repository Interface
 */

import { Result } from '@/6-core/result/Result';
import { RSSFeed, RSSFeedItem } from '@/3-domain/entities/RSSFeed';

export interface CreateRSSFeedDto {
  programId: string;
  name: string;
  feedUrl: string;
  description?: string | null;
  category?: string | null;
  isActive?: boolean;
  autoPublish?: boolean;
  checkIntervalMinutes?: number;
  createdBy?: string | null;
}

export interface UpdateRSSFeedDto {
  name?: string;
  feedUrl?: string;
  description?: string | null;
  category?: string | null;
  isActive?: boolean;
  autoPublish?: boolean;
  checkIntervalMinutes?: number;
  updatedBy?: string | null;
}

export interface RSSFeedFilterDto {
  programId?: string;
  isActive?: boolean;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface IRSSFeedRepository {
  /**
   * RSS feed oluştur
   */
  create(dto: CreateRSSFeedDto): Promise<Result<RSSFeed>>;

  /**
   * RSS feed güncelle
   */
  update(id: string, dto: UpdateRSSFeedDto): Promise<Result<RSSFeed>>;

  /**
   * RSS feed sil
   */
  delete(id: string): Promise<Result<void>>;

  /**
   * RSS feed bul (ID ile)
   */
  findById(id: string): Promise<Result<RSSFeed | null>>;

  /**
   * RSS feed'leri listele
   */
  findAll(filter?: RSSFeedFilterDto): Promise<Result<{ data: RSSFeed[]; total: number }>>;

  /**
   * Aktif feed'leri bul
   */
  findActiveFeeds(): Promise<Result<RSSFeed[]>>;

  /**
   * Kontrol edilmesi gereken feed'leri bul
   */
  findFeedsToCheck(): Promise<Result<RSSFeed[]>>;

  /**
   * RSS feed item oluştur
   */
  createFeedItem(
    item: Omit<RSSFeedItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Result<RSSFeedItem>>;

  /**
   * RSS feed item bul (ID ile)
   */
  findFeedItemById(id: string): Promise<Result<RSSFeedItem | null>>;

  /**
   * RSS feed item bul (GUID ile)
   */
  findFeedItemByGuid(guid: string): Promise<Result<RSSFeedItem | null>>;

  /**
   * RSS feed item'ları listele
   */
  findFeedItemsByFeedId(
    feedId: string,
    limit?: number,
    offset?: number
  ): Promise<Result<{ data: RSSFeedItem[]; total: number }>>;

  /**
   * İşlenmemiş feed item'ları bul
   */
  findUnprocessedItems(feedId?: string): Promise<Result<RSSFeedItem[]>>;

  /**
   * Feed item'ı işlenmiş olarak işaretle
   */
  markItemAsProcessed(itemId: string, newsId: string): Promise<Result<void>>;
}
