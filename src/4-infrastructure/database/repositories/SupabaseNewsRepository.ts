import { createClient, getSupabaseAdminClient } from '@/infrastructure/database/supabase-server';
import { Result } from '@/6-core/result/Result';
import {
  INewsRepository,
  NewsFilters,
  NewsWithTags,
} from '@/3-domain/interfaces/repositories/INewsRepository';
import { News, NewsTag, NewsComment, NewsLike, NewsRead } from '@/3-domain/entities/News';
import { NewsStatus } from '@/3-domain/enums/NewsEnums';

export class SupabaseNewsRepository implements INewsRepository {
  // =====================================================
  // NEWS CRUD
  // =====================================================

  private async getSupabaseClient() {
    // In test environment, use admin client to bypass RLS
    if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
      return getSupabaseAdminClient();
    }
    return await createClient();
  }

  async create(news: Omit<News, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<News>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('news')
        .insert({
          program_id: news.programId,
          author_id: news.authorId,
          title: news.title,
          slug: news.slug,
          summary: news.summary,
          content: news.content,
          category: news.category,
          status: news.status,
          image_url: news.imageUrl,
          image_alt: news.imageAlt,
          meta_description: news.metaDescription,
          meta_keywords: news.metaKeywords,
          is_featured: news.isFeatured,
          is_pinned: news.isPinned,
          reading_time: news.readingTime,
          view_count: news.viewCount,
          like_count: news.likeCount,
          comment_count: news.commentCount,
          published_at: news.publishedAt,
          archived_at: news.archivedAt,
          created_by: news.createdBy,
          updated_by: news.updatedBy,
        })
        .select()
        .single();

      if (error) {
        return Result.fail(`Haber oluşturulamadı: ${error.message}`);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(`Haber oluşturulamadı: ${error}`);
    }
  }

  async findById(id: string): Promise<Result<News | null>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase.from('news').select('*').eq('id', id).single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(`Haber bulunamadı: ${error.message}`);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(`Haber bulunamadı: ${error}`);
    }
  }

  async findBySlug(slug: string): Promise<Result<News | null>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase.from('news').select('*').eq('slug', slug).single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(`Haber bulunamadı: ${error.message}`);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(`Haber bulunamadı: ${error}`);
    }
  }

  async findAll(filters: NewsFilters): Promise<Result<NewsWithTags[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase.from('news').select(`
          *,
          users!news_author_id_fkey(id, full_name),
          news_tag_relations(
            news_tags(*)
          )
        `);

      // Apply filters
      if (filters.programId) {
        query = query.eq('program_id', filters.programId);
      }

      if (filters.authorId) {
        query = query.eq('author_id', filters.authorId);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.isFeatured !== undefined) {
        query = query.eq('is_featured', filters.isFeatured);
      }

      if (filters.isPinned !== undefined) {
        query = query.eq('is_pinned', filters.isPinned);
      }

      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,summary.ilike.%${filters.search}%,content.ilike.%${filters.search}%`
        );
      }

      // Order by pinned first, then published date
      query = query.order('is_pinned', { ascending: false });
      query = query.order('published_at', { ascending: false, nullsFirst: false });

      // Pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        return Result.fail(`Haberler listelenemedi: ${error.message}`);
      }

      const newsWithTags = data.map((item: any) => {
        const news = this.mapToEntity(item);
        const tags =
          item.news_tag_relations?.map((rel: any) => this.mapToTagEntity(rel.news_tags)) || [];
        const authorName = item.users?.full_name || 'Bilinmeyen';

        return {
          ...news,
          tags,
          authorName,
        };
      });

      return Result.ok(newsWithTags);
    } catch (error) {
      return Result.fail(`Haberler listelenemedi: ${error}`);
    }
  }

  async update(id: string, news: Partial<News>): Promise<Result<News>> {
    try {
      const supabase = await this.getSupabaseClient();

      const updateData: any = {};

      if (news.title !== undefined) updateData.title = news.title;
      if (news.summary !== undefined) updateData.summary = news.summary;
      if (news.content !== undefined) updateData.content = news.content;
      if (news.category !== undefined) updateData.category = news.category;
      if (news.status !== undefined) updateData.status = news.status;
      if (news.imageUrl !== undefined) updateData.image_url = news.imageUrl;
      if (news.imageAlt !== undefined) updateData.image_alt = news.imageAlt;
      if (news.metaDescription !== undefined) updateData.meta_description = news.metaDescription;
      if (news.metaKeywords !== undefined) updateData.meta_keywords = news.metaKeywords;
      if (news.isFeatured !== undefined) updateData.is_featured = news.isFeatured;
      if (news.isPinned !== undefined) updateData.is_pinned = news.isPinned;
      if (news.readingTime !== undefined) updateData.reading_time = news.readingTime;
      if (news.publishedAt !== undefined) updateData.published_at = news.publishedAt;
      if (news.archivedAt !== undefined) updateData.archived_at = news.archivedAt;
      if (news.updatedBy !== undefined) updateData.updated_by = news.updatedBy;

      const { data, error } = await supabase
        .from('news')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return Result.fail(`Haber güncellenemedi: ${error.message}`);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(`Haber güncellenemedi: ${error}`);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase.from('news').delete().eq('id', id);

      if (error) {
        return Result.fail(`Haber silinemedi: ${error.message}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Haber silinemedi: ${error}`);
    }
  }

  // =====================================================
  // STATUS OPERATIONS
  // =====================================================

  async publish(id: string, userId: string): Promise<Result<News>> {
    return this.update(id, {
      status: NewsStatus.PUBLISHED,
      publishedAt: new Date(),
      updatedBy: userId,
    });
  }

  async archive(id: string, userId: string): Promise<Result<News>> {
    return this.update(id, {
      status: NewsStatus.ARCHIVED,
      archivedAt: new Date(),
      updatedBy: userId,
    });
  }

  async unpublish(id: string, userId: string): Promise<Result<News>> {
    return this.update(id, {
      status: NewsStatus.DRAFT,
      publishedAt: null,
      updatedBy: userId,
    });
  }

  // =====================================================
  // FEATURE OPERATIONS
  // =====================================================

  async feature(id: string): Promise<Result<News>> {
    return this.update(id, { isFeatured: true });
  }

  async unfeature(id: string): Promise<Result<News>> {
    return this.update(id, { isFeatured: false });
  }

  async pin(id: string): Promise<Result<News>> {
    return this.update(id, { isPinned: true });
  }

  async unpin(id: string): Promise<Result<News>> {
    return this.update(id, { isPinned: false });
  }

  // =====================================================
  // TAGS
  // =====================================================

  async getTags(): Promise<Result<NewsTag[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('news_tags')
        .select('*')
        .order('usage_count', { ascending: false });

      if (error) {
        return Result.fail(`Etiketler listelenemedi: ${error.message}`);
      }

      return Result.ok(data.map(this.mapToTagEntity));
    } catch (error) {
      return Result.fail(`Etiketler listelenemedi: ${error}`);
    }
  }

  async createTag(name: string, slug: string): Promise<Result<NewsTag>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('news_tags')
        .insert({ name, slug })
        .select()
        .single();

      if (error) {
        return Result.fail(`Etiket oluşturulamadı: ${error.message}`);
      }

      return Result.ok(this.mapToTagEntity(data));
    } catch (error) {
      return Result.fail(`Etiket oluşturulamadı: ${error}`);
    }
  }

  async addTagToNews(newsId: string, tagId: string): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase
        .from('news_tag_relations')
        .insert({ news_id: newsId, tag_id: tagId });

      if (error) {
        return Result.fail(`Etiket eklenemedi: ${error.message}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Etiket eklenemedi: ${error}`);
    }
  }

  async removeTagFromNews(newsId: string, tagId: string): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase
        .from('news_tag_relations')
        .delete()
        .eq('news_id', newsId)
        .eq('tag_id', tagId);

      if (error) {
        return Result.fail(`Etiket kaldırılamadı: ${error.message}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Etiket kaldırılamadı: ${error}`);
    }
  }

  async getNewsTags(newsId: string): Promise<Result<NewsTag[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('news_tag_relations')
        .select('news_tags(*)')
        .eq('news_id', newsId);

      if (error) {
        return Result.fail(`Etiketler listelenemedi: ${error.message}`);
      }

      const tags = data.map((item: any) => this.mapToTagEntity(item.news_tags));
      return Result.ok(tags);
    } catch (error) {
      return Result.fail(`Etiketler listelenemedi: ${error}`);
    }
  }

  // =====================================================
  // COMMENTS
  // =====================================================

  async createComment(
    comment: Omit<NewsComment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Result<NewsComment>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('news_comments')
        .insert({
          news_id: comment.newsId,
          user_id: comment.userId,
          company_id: comment.companyId,
          content: comment.content,
          parent_id: comment.parentId,
          is_approved: comment.isApproved,
          is_edited: comment.isEdited,
        })
        .select()
        .single();

      if (error) {
        return Result.fail(`Yorum oluşturulamadı: ${error.message}`);
      }

      return Result.ok(this.mapToCommentEntity(data));
    } catch (error) {
      return Result.fail(`Yorum oluşturulamadı: ${error}`);
    }
  }

  async getComments(newsId: string): Promise<Result<NewsComment[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('news_comments')
        .select('*')
        .eq('news_id', newsId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) {
        return Result.fail(`Yorumlar listelenemedi: ${error.message}`);
      }

      return Result.ok(data.map(this.mapToCommentEntity));
    } catch (error) {
      return Result.fail(`Yorumlar listelenemedi: ${error}`);
    }
  }

  async updateComment(id: string, content: string): Promise<Result<NewsComment>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('news_comments')
        .update({ content, is_edited: true })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return Result.fail(`Yorum güncellenemedi: ${error.message}`);
      }

      return Result.ok(this.mapToCommentEntity(data));
    } catch (error) {
      return Result.fail(`Yorum güncellenemedi: ${error}`);
    }
  }

  async deleteComment(id: string): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase.from('news_comments').delete().eq('id', id);

      if (error) {
        return Result.fail(`Yorum silinemedi: ${error.message}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Yorum silinemedi: ${error}`);
    }
  }

  async approveComment(id: string): Promise<Result<NewsComment>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('news_comments')
        .update({ is_approved: true })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return Result.fail(`Yorum onaylanamadı: ${error.message}`);
      }

      return Result.ok(this.mapToCommentEntity(data));
    } catch (error) {
      return Result.fail(`Yorum onaylanamadı: ${error}`);
    }
  }

  // =====================================================
  // LIKES
  // =====================================================

  async likeNews(
    newsId: string,
    userId: string,
    companyId: string | null
  ): Promise<Result<NewsLike>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('news_likes')
        .insert({
          news_id: newsId,
          user_id: userId,
          company_id: companyId,
        })
        .select()
        .single();

      if (error) {
        return Result.fail(`Beğeni eklenemedi: ${error.message}`);
      }

      return Result.ok(this.mapToLikeEntity(data));
    } catch (error) {
      return Result.fail(`Beğeni eklenemedi: ${error}`);
    }
  }

  async unlikeNews(newsId: string, userId: string): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase
        .from('news_likes')
        .delete()
        .eq('news_id', newsId)
        .eq('user_id', userId);

      if (error) {
        return Result.fail(`Beğeni kaldırılamadı: ${error.message}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Beğeni kaldırılamadı: ${error}`);
    }
  }

  async isLikedByUser(newsId: string, userId: string): Promise<Result<boolean>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('news_likes')
        .select('id')
        .eq('news_id', newsId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(false);
        }
        return Result.fail(`Beğeni kontrolü yapılamadı: ${error.message}`);
      }

      return Result.ok(!!data);
    } catch (error) {
      return Result.fail(`Beğeni kontrolü yapılamadı: ${error}`);
    }
  }

  // =====================================================
  // READS (for leaderboard)
  // =====================================================

  async recordRead(read: Omit<NewsRead, 'id' | 'createdAt'>): Promise<Result<NewsRead>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('news_reads')
        .insert({
          news_id: read.newsId,
          user_id: read.userId,
          company_id: read.companyId,
          read_duration: read.readDuration,
          scroll_percentage: read.scrollPercentage,
          completed: read.completed,
        })
        .select()
        .single();

      if (error) {
        return Result.fail(`Okuma kaydedilemedi: ${error.message}`);
      }

      return Result.ok(this.mapToReadEntity(data));
    } catch (error) {
      return Result.fail(`Okuma kaydedilemedi: ${error}`);
    }
  }

  async getUserReads(userId: string, programId?: string): Promise<Result<NewsRead[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase
        .from('news_reads')
        .select('*, news!inner(program_id)')
        .eq('user_id', userId);

      if (programId) {
        query = query.eq('news.program_id', programId);
      }

      const { data, error } = await query;

      if (error) {
        return Result.fail(`Okumalar listelenemedi: ${error.message}`);
      }

      return Result.ok(data.map(this.mapToReadEntity));
    } catch (error) {
      return Result.fail(`Okumalar listelenemedi: ${error}`);
    }
  }

  async getNewsReads(newsId: string): Promise<Result<NewsRead[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase.from('news_reads').select('*').eq('news_id', newsId);

      if (error) {
        return Result.fail(`Okumalar listelenemedi: ${error.message}`);
      }

      return Result.ok(data.map(this.mapToReadEntity));
    } catch (error) {
      return Result.fail(`Okumalar listelenemedi: ${error}`);
    }
  }

  // =====================================================
  // STATISTICS
  // =====================================================

  async getStatistics(programId?: string): Promise<
    Result<{
      totalNews: number;
      publishedNews: number;
      draftNews: number;
      totalViews: number;
      totalLikes: number;
      totalComments: number;
      totalReads: number;
      completedReads: number;
    }>
  > {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase.from('news').select('*');

      if (programId) {
        query = query.eq('program_id', programId);
      }

      const { data, error } = await query;

      if (error) {
        return Result.fail(`İstatistikler alınamadı: ${error.message}`);
      }

      const totalNews = data.length;
      const publishedNews = data.filter((n) => n.status === 'published').length;
      const draftNews = data.filter((n) => n.status === 'draft').length;
      const totalViews = data.reduce((sum, n) => sum + (n.view_count || 0), 0);
      const totalLikes = data.reduce((sum, n) => sum + (n.like_count || 0), 0);
      const totalComments = data.reduce((sum, n) => sum + (n.comment_count || 0), 0);

      // Get reads statistics
      let readsQuery = supabase.from('news_reads').select('*');
      if (programId) {
        readsQuery = readsQuery.in(
          'news_id',
          data.map((n) => n.id)
        );
      }

      const { data: readsData } = await readsQuery;
      const totalReads = readsData?.length || 0;
      const completedReads = readsData?.filter((r) => r.completed).length || 0;

      return Result.ok({
        totalNews,
        publishedNews,
        draftNews,
        totalViews,
        totalLikes,
        totalComments,
        totalReads,
        completedReads,
      });
    } catch (error) {
      return Result.fail(`İstatistikler alınamadı: ${error}`);
    }
  }

  // =====================================================
  // MAPPERS
  // =====================================================

  private mapToEntity(data: any): News {
    return {
      id: data.id,
      programId: data.program_id,
      authorId: data.author_id,
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      content: data.content,
      category: data.category,
      status: data.status,
      imageUrl: data.image_url,
      imageAlt: data.image_alt,
      metaDescription: data.meta_description,
      metaKeywords: data.meta_keywords,
      isFeatured: data.is_featured,
      isPinned: data.is_pinned,
      readingTime: data.reading_time,
      viewCount: data.view_count,
      likeCount: data.like_count,
      commentCount: data.comment_count,
      publishedAt: data.published_at ? new Date(data.published_at) : null,
      archivedAt: data.archived_at ? new Date(data.archived_at) : null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by,
      updatedBy: data.updated_by,
    };
  }

  private mapToTagEntity(data: any): NewsTag {
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      usageCount: data.usage_count,
      createdAt: new Date(data.created_at),
    };
  }

  private mapToCommentEntity(data: any): NewsComment {
    return {
      id: data.id,
      newsId: data.news_id,
      userId: data.user_id,
      companyId: data.company_id,
      content: data.content,
      parentId: data.parent_id,
      isApproved: data.is_approved,
      isEdited: data.is_edited,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapToLikeEntity(data: any): NewsLike {
    return {
      id: data.id,
      newsId: data.news_id,
      userId: data.user_id,
      companyId: data.company_id,
      createdAt: new Date(data.created_at),
    };
  }

  private mapToReadEntity(data: any): NewsRead {
    return {
      id: data.id,
      newsId: data.news_id,
      userId: data.user_id,
      companyId: data.company_id,
      readDuration: data.read_duration,
      completed: data.completed,
      scrollPercentage: data.scroll_percentage,
      createdAt: new Date(data.created_at),
    };
  }
}
