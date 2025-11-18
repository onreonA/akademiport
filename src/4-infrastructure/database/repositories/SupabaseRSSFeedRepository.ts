/**
 * Supabase RSS Feed Repository
 *
 * RSS feed ve feed item repository implementasyonu
 */

import { createClient, getSupabaseAdminClient } from '@/4-infrastructure/database/supabase-server';
import { Result } from '@/6-core/result/Result';
import {
  IRSSFeedRepository,
  CreateRSSFeedDto,
  UpdateRSSFeedDto,
  RSSFeedFilterDto,
} from '@/3-domain/interfaces/repositories/IRSSFeedRepository';
import { RSSFeed, RSSFeedItem, RSSFeedEntity } from '@/3-domain/entities/RSSFeed';

export class SupabaseRSSFeedRepository implements IRSSFeedRepository {
  private async getSupabaseClient() {
    // In test environment, use admin client to bypass RLS
    if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
      return getSupabaseAdminClient();
    }
    return await createClient();
  }

  // =====================================================
  // RSS FEED CRUD
  // =====================================================

  async create(dto: CreateRSSFeedDto): Promise<Result<RSSFeed>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('rss_feeds')
        .insert({
          program_id: dto.programId,
          name: dto.name,
          feed_url: dto.feedUrl,
          description: dto.description,
          category: dto.category,
          is_active: dto.isActive ?? true,
          auto_publish: dto.autoPublish ?? false,
          check_interval_minutes: dto.checkIntervalMinutes ?? 360,
          created_by: dto.createdBy,
        })
        .select()
        .single();

      if (error) {
        return Result.fail(`RSS feed oluşturulamadı: ${error.message}`);
      }

      return Result.ok(this.mapFeedToEntity(data));
    } catch (error) {
      return Result.fail(`RSS feed oluşturulamadı: ${error}`);
    }
  }

  async update(id: string, dto: UpdateRSSFeedDto): Promise<Result<RSSFeed>> {
    try {
      const supabase = await this.getSupabaseClient();

      const updateData: Record<string, unknown> = {};
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.feedUrl !== undefined) updateData.feed_url = dto.feedUrl;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.category !== undefined) updateData.category = dto.category;
      if (dto.isActive !== undefined) updateData.is_active = dto.isActive;
      if (dto.autoPublish !== undefined) updateData.auto_publish = dto.autoPublish;
      if (dto.checkIntervalMinutes !== undefined)
        updateData.check_interval_minutes = dto.checkIntervalMinutes;
      if (dto.updatedBy !== undefined) updateData.updated_by = dto.updatedBy;

      const { data, error } = await supabase
        .from('rss_feeds')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return Result.fail(`RSS feed güncellenemedi: ${error.message}`);
      }

      return Result.ok(this.mapFeedToEntity(data));
    } catch (error) {
      return Result.fail(`RSS feed güncellenemedi: ${error}`);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase.from('rss_feeds').delete().eq('id', id);

      if (error) {
        return Result.fail(`RSS feed silinemedi: ${error.message}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`RSS feed silinemedi: ${error}`);
    }
  }

  async findById(id: string): Promise<Result<RSSFeed | null>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase.from('rss_feeds').select('*').eq('id', id).single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(`RSS feed bulunamadı: ${error.message}`);
      }

      return Result.ok(this.mapFeedToEntity(data));
    } catch (error) {
      return Result.fail(`RSS feed bulunamadı: ${error}`);
    }
  }

  async findAll(filter?: RSSFeedFilterDto): Promise<Result<{ data: RSSFeed[]; total: number }>> {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase.from('rss_feeds').select('*', { count: 'exact' });

      if (filter?.programId) {
        query = query.eq('program_id', filter.programId);
      }

      if (filter?.isActive !== undefined) {
        query = query.eq('is_active', filter.isActive);
      }

      if (filter?.category) {
        query = query.eq('category', filter.category);
      }

      if (filter?.limit) {
        query = query.limit(filter.limit);
      }

      if (filter?.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        return Result.fail(`RSS feed'ler listelenemedi: ${error.message}`);
      }

      const feeds = (data || []).map((item) => this.mapFeedToEntity(item));

      return Result.ok({
        data: feeds,
        total: count || 0,
      });
    } catch (error) {
      return Result.fail(`RSS feed'ler listelenemedi: ${error}`);
    }
  }

  async findActiveFeeds(): Promise<Result<RSSFeed[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase.from('rss_feeds').select('*').eq('is_active', true);

      if (error) {
        return Result.fail(`Aktif RSS feed'ler bulunamadı: ${error.message}`);
      }

      const feeds = (data || []).map((item) => this.mapFeedToEntity(item));

      return Result.ok(feeds);
    } catch (error) {
      return Result.fail(`Aktif RSS feed'ler bulunamadı: ${error}`);
    }
  }

  async findFeedsToCheck(): Promise<Result<RSSFeed[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      // Aktif feed'leri al (shouldCheck entity'de kontrol edilecek)
      const { data, error } = await supabase.from('rss_feeds').select('*').eq('is_active', true);

      if (error) {
        return Result.fail(`Kontrol edilecek RSS feed'ler bulunamadı: ${error.message}`);
      }

      // Entity'de shouldCheck() ile filtrele
      const feeds = (data || [])
        .map((item) => this.mapFeedToEntity(item))
        .filter((feed) => {
          const feedEntity = new RSSFeedEntity(feed);
          return feedEntity.shouldCheck();
        });

      return Result.ok(feeds);
    } catch (error) {
      return Result.fail(`Kontrol edilecek RSS feed'ler bulunamadı: ${error}`);
    }
  }

  // =====================================================
  // RSS FEED ITEM CRUD
  // =====================================================

  async createFeedItem(
    item: Omit<RSSFeedItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Result<RSSFeedItem>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('rss_feed_items')
        .insert({
          feed_id: item.feedId,
          title: item.title,
          link: item.link,
          description: item.description,
          content: item.content,
          author: item.author,
          pub_date: item.pubDate,
          guid: item.guid,
          image_url: item.imageUrl,
          categories: item.categories,
          is_processed: item.isProcessed,
          processed_at: item.processedAt,
          news_id: item.newsId,
        })
        .select()
        .single();

      if (error) {
        return Result.fail(`RSS feed item oluşturulamadı: ${error.message}`);
      }

      return Result.ok(this.mapFeedItemToEntity(data));
    } catch (error) {
      return Result.fail(`RSS feed item oluşturulamadı: ${error}`);
    }
  }

  async findFeedItemById(id: string): Promise<Result<RSSFeedItem | null>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('rss_feed_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(`RSS feed item bulunamadı: ${error.message}`);
      }

      return Result.ok(this.mapFeedItemToEntity(data));
    } catch (error) {
      return Result.fail(`RSS feed item bulunamadı: ${error}`);
    }
  }

  async findFeedItemByGuid(guid: string): Promise<Result<RSSFeedItem | null>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('rss_feed_items')
        .select('*')
        .eq('guid', guid)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(`RSS feed item bulunamadı: ${error.message}`);
      }

      return Result.ok(this.mapFeedItemToEntity(data));
    } catch (error) {
      return Result.fail(`RSS feed item bulunamadı: ${error}`);
    }
  }

  async findFeedItemsByFeedId(
    feedId: string,
    limit?: number,
    offset?: number
  ): Promise<Result<{ data: RSSFeedItem[]; total: number }>> {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase
        .from('rss_feed_items')
        .select('*', { count: 'exact' })
        .eq('feed_id', feedId)
        .order('pub_date', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      if (offset !== undefined) {
        query = query.range(offset, offset + (limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        return Result.fail(`RSS feed item'ları listelenemedi: ${error.message}`);
      }

      const items = (data || []).map((item) => this.mapFeedItemToEntity(item));

      return Result.ok({
        data: items,
        total: count || 0,
      });
    } catch (error) {
      return Result.fail(`RSS feed item'ları listelenemedi: ${error}`);
    }
  }

  async findUnprocessedItems(feedId?: string): Promise<Result<RSSFeedItem[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase
        .from('rss_feed_items')
        .select('*')
        .eq('is_processed', false)
        .order('pub_date', { ascending: false });

      if (feedId) {
        query = query.eq('feed_id', feedId);
      }

      const { data, error } = await query;

      if (error) {
        return Result.fail(`İşlenmemiş RSS feed item'ları bulunamadı: ${error.message}`);
      }

      const items = (data || []).map((item) => this.mapFeedItemToEntity(item));

      return Result.ok(items);
    } catch (error) {
      return Result.fail(`İşlenmemiş RSS feed item'ları bulunamadı: ${error}`);
    }
  }

  async markItemAsProcessed(itemId: string, newsId: string): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase
        .from('rss_feed_items')
        .update({
          is_processed: true,
          processed_at: new Date().toISOString(),
          news_id: newsId,
        })
        .eq('id', itemId);

      if (error) {
        return Result.fail(`RSS feed item işaretlenemedi: ${error.message}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`RSS feed item işaretlenemedi: ${error}`);
    }
  }

  // =====================================================
  // MAPPING
  // =====================================================

  private mapFeedToEntity(data: any): RSSFeed {
    return {
      id: data.id,
      programId: data.program_id,
      name: data.name,
      feedUrl: data.feed_url,
      description: data.description,
      category: data.category,
      isActive: data.is_active,
      autoPublish: data.auto_publish,
      checkIntervalMinutes: data.check_interval_minutes,
      lastCheckedAt: data.last_checked_at ? new Date(data.last_checked_at) : null,
      lastError: data.last_error,
      errorCount: data.error_count,
      successCount: data.success_count,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by,
      updatedBy: data.updated_by,
    };
  }

  private mapFeedItemToEntity(data: any): RSSFeedItem {
    return {
      id: data.id,
      feedId: data.feed_id,
      title: data.title,
      link: data.link,
      description: data.description,
      content: data.content,
      author: data.author,
      pubDate: data.pub_date ? new Date(data.pub_date) : null,
      guid: data.guid,
      imageUrl: data.image_url,
      categories: data.categories || [],
      isProcessed: data.is_processed,
      processedAt: data.processed_at ? new Date(data.processed_at) : null,
      newsId: data.news_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
