import { createClient, getSupabaseAdminClient } from '@/4-infrastructure/database/supabase-server';
import { Result } from '@/6-core/result/Result';
import {
  IForumRepository,
  ForumTopicFilters,
  ForumReplyFilters,
  ForumTopicWithDetails,
  ForumReplyWithDetails,
} from '@/3-domain/interfaces/repositories/IForumRepository';
import {
  ForumCategory,
  ForumTopic,
  ForumReply,
  ForumLike,
  ForumNotification,
  ForumActivity,
} from '@/3-domain/entities/Forum';
import { TopicStatus, TopicPriority } from '@/3-domain/enums/ForumEnums';
import { trackSupabaseQuery } from '@/5-shared/middleware/query-performance';

export class SupabaseForumRepository implements IForumRepository {
  private async getSupabaseClient() {
    // In test environment, use admin client to bypass RLS
    if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
      return getSupabaseAdminClient();
    }
    return await createClient();
  }

  // =====================================================
  // CATEGORIES
  // =====================================================

  async createCategory(
    category: Omit<ForumCategory, 'id' | 'createdAt' | 'updatedAt' | 'topicCount' | 'replyCount'>
  ): Promise<Result<ForumCategory>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('forum_categories')
        .insert({
          program_id: category.programId,
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon,
          color: category.color,
          order_index: category.orderIndex,
          is_active: category.isActive,
          require_approval: category.requireApproval,
          created_by: category.createdBy,
        })
        .select()
        .single();

      if (error) {
        return Result.fail(`Kategori oluşturulamadı: ${error.message}`);
      }

      return Result.ok(this.mapToCategoryEntity(data));
    } catch (error) {
      return Result.fail(`Kategori oluşturulamadı: ${error}`);
    }
  }

  async findCategoryById(id: string): Promise<Result<ForumCategory | null>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(`Kategori bulunamadı: ${error.message}`);
      }

      return Result.ok(this.mapToCategoryEntity(data));
    } catch (error) {
      return Result.fail(`Kategori bulunamadı: ${error}`);
    }
  }

  async findCategoryBySlug(programId: string, slug: string): Promise<Result<ForumCategory | null>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('program_id', programId)
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(`Kategori bulunamadı: ${error.message}`);
      }

      return Result.ok(this.mapToCategoryEntity(data));
    } catch (error) {
      return Result.fail(`Kategori bulunamadı: ${error}`);
    }
  }

  async findAllCategories(programId: string): Promise<Result<ForumCategory[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('program_id', programId)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) {
        return Result.fail(`Kategoriler listelenemedi: ${error.message}`);
      }

      return Result.ok(data.map(this.mapToCategoryEntity));
    } catch (error) {
      return Result.fail(`Kategoriler listelenemedi: ${error}`);
    }
  }

  async updateCategory(
    id: string,
    category: Partial<ForumCategory>
  ): Promise<Result<ForumCategory>> {
    try {
      const supabase = await this.getSupabaseClient();

      const updateData: any = {};
      if (category.name !== undefined) updateData.name = category.name;
      if (category.slug !== undefined) updateData.slug = category.slug;
      if (category.description !== undefined) updateData.description = category.description;
      if (category.icon !== undefined) updateData.icon = category.icon;
      if (category.color !== undefined) updateData.color = category.color;
      if (category.orderIndex !== undefined) updateData.order_index = category.orderIndex;
      if (category.isActive !== undefined) updateData.is_active = category.isActive;
      if (category.requireApproval !== undefined)
        updateData.require_approval = category.requireApproval;

      const { data, error } = await supabase
        .from('forum_categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return Result.fail(`Kategori güncellenemedi: ${error.message}`);
      }

      return Result.ok(this.mapToCategoryEntity(data));
    } catch (error) {
      return Result.fail(`Kategori güncellenemedi: ${error}`);
    }
  }

  async deleteCategory(id: string): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase.from('forum_categories').delete().eq('id', id);

      if (error) {
        return Result.fail(`Kategori silinemedi: ${error.message}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Kategori silinemedi: ${error}`);
    }
  }

  // =====================================================
  // TOPICS
  // =====================================================

  async createTopic(
    topic: Omit<
      ForumTopic,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'viewCount'
      | 'replyCount'
      | 'likeCount'
      | 'lastReplyAt'
      | 'lastReplyBy'
    >
  ): Promise<Result<ForumTopic>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('forum_topics')
        .insert({
          category_id: topic.categoryId,
          program_id: topic.programId,
          author_id: topic.authorId,
          company_id: topic.companyId || null, // Convert empty string to null for admin users
          title: topic.title,
          slug: topic.slug,
          content: topic.content,
          status: topic.status,
          priority: topic.priority,
          is_pinned: topic.isPinned,
          is_locked: topic.isLocked,
          is_approved: topic.isApproved,
          solution_reply_id: topic.solutionReplyId,
          solved_at: topic.solvedAt,
          solved_by: topic.solvedBy,
        })
        .select()
        .single();

      if (error) {
        return Result.fail(`Konu oluşturulamadı: ${error.message}`);
      }

      return Result.ok(this.mapToTopicEntity(data));
    } catch (error) {
      return Result.fail(`Konu oluşturulamadı: ${error}`);
    }
  }

  async findTopicById(id: string): Promise<Result<ForumTopic | null>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase.from('forum_topics').select('*').eq('id', id).single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(`Konu bulunamadı: ${error.message}`);
      }

      return Result.ok(this.mapToTopicEntity(data));
    } catch (error) {
      return Result.fail(`Konu bulunamadı: ${error}`);
    }
  }

  async findTopicBySlug(programId: string, slug: string): Promise<Result<ForumTopic | null>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('forum_topics')
        .select('*')
        .eq('program_id', programId)
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(`Konu bulunamadı: ${error.message}`);
      }

      return Result.ok(this.mapToTopicEntity(data));
    } catch (error) {
      return Result.fail(`Konu bulunamadı: ${error}`);
    }
  }

  async findAllTopics(
    filters: ForumTopicFilters
  ): Promise<Result<{ topics: ForumTopicWithDetails[]; total: number }>> {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase.from('forum_topics').select(
        `
          *,
          forum_categories!forum_topics_category_id_fkey(*),
          users!forum_topics_author_id_fkey(id, full_name, email),
          companies(id, name)
        `,
        { count: 'exact' }
      );

      // Apply filters
      if (filters.programId) {
        query = query.eq('program_id', filters.programId);
      }

      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters.authorId) {
        query = query.eq('author_id', filters.authorId);
      }

      if (filters.companyId) {
        query = query.eq('company_id', filters.companyId);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }

      if (filters.isPinned !== undefined) {
        query = query.eq('is_pinned', filters.isPinned);
      }

      if (filters.isLocked !== undefined) {
        query = query.eq('is_locked', filters.isLocked);
      }

      if (filters.isApproved !== undefined) {
        query = query.eq('is_approved', filters.isApproved);
      }

      if (filters.search) {
        query = query.textSearch('title', filters.search, {
          type: 'websearch',
          config: 'turkish',
        });
      }

      // Sorting - default to lastReplyAt descending
      query = query.order('last_reply_at', { ascending: false });

      // Pagination
      if (filters.limit) {
        query = query.range(filters.offset || 0, (filters.offset || 0) + filters.limit - 1);
      }

      const result = await trackSupabaseQuery(
        'ForumRepository.findAllTopics',
        async () => {
          const result = await query;
          return result;
        },
        {
          filters: {
            programId: filters.programId,
            categoryId: filters.categoryId,
            limit: filters.limit,
            offset: filters.offset,
          },
        }
      );
      const { data, error, count } = result;

      if (error) {
        return Result.fail(`Konular listelenemedi: ${error.message}`);
      }

      const topics: ForumTopicWithDetails[] = (data || []).map((item: any) => ({
        ...this.mapToTopicEntity(item),
        category: item.forum_categories
          ? this.mapToCategoryEntity(item.forum_categories)
          : undefined,
        authorName: item.users?.full_name,
        authorEmail: item.users?.email,
        companyName: item.companies?.name,
      }));

      return Result.ok({
        topics,
        total: count || 0,
      });
    } catch (error) {
      return Result.fail(`Konular listelenemedi: ${error}`);
    }
  }

  async updateTopic(id: string, topic: Partial<ForumTopic>): Promise<Result<ForumTopic>> {
    try {
      const supabase = await this.getSupabaseClient();

      const updateData: any = {};
      if (topic.title !== undefined) updateData.title = topic.title;
      if (topic.content !== undefined) updateData.content = topic.content;
      if (topic.categoryId !== undefined) updateData.category_id = topic.categoryId;
      if (topic.status !== undefined) updateData.status = topic.status;
      if (topic.priority !== undefined) updateData.priority = topic.priority;
      if (topic.isPinned !== undefined) updateData.is_pinned = topic.isPinned;
      if (topic.isLocked !== undefined) updateData.is_locked = topic.isLocked;
      if (topic.isApproved !== undefined) updateData.is_approved = topic.isApproved;
      if (topic.solutionReplyId !== undefined) updateData.solution_reply_id = topic.solutionReplyId;
      if (topic.solvedAt !== undefined) updateData.solved_at = topic.solvedAt;
      if (topic.solvedBy !== undefined) updateData.solved_by = topic.solvedBy;

      const { data, error } = await supabase
        .from('forum_topics')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return Result.fail(`Konu güncellenemedi: ${error.message}`);
      }

      return Result.ok(this.mapToTopicEntity(data));
    } catch (error) {
      return Result.fail(`Konu güncellenemedi: ${error}`);
    }
  }

  async deleteTopic(id: string): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase.from('forum_topics').delete().eq('id', id);

      if (error) {
        return Result.fail(`Konu silinemedi: ${error.message}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Konu silinemedi: ${error}`);
    }
  }

  // Topic operations
  async pinTopic(id: string): Promise<Result<ForumTopic>> {
    return this.updateTopic(id, { isPinned: true });
  }

  async unpinTopic(id: string): Promise<Result<ForumTopic>> {
    return this.updateTopic(id, { isPinned: false });
  }

  async lockTopic(id: string): Promise<Result<ForumTopic>> {
    return this.updateTopic(id, { isLocked: true });
  }

  async unlockTopic(id: string): Promise<Result<ForumTopic>> {
    return this.updateTopic(id, { isLocked: false });
  }

  async closeTopic(id: string): Promise<Result<ForumTopic>> {
    return this.updateTopic(id, { status: TopicStatus.CLOSED });
  }

  async openTopic(id: string): Promise<Result<ForumTopic>> {
    return this.updateTopic(id, { status: TopicStatus.OPEN });
  }

  async approveTopic(id: string): Promise<Result<ForumTopic>> {
    return this.updateTopic(id, { isApproved: true });
  }

  async rejectTopic(id: string): Promise<Result<ForumTopic>> {
    return this.updateTopic(id, { isApproved: false });
  }

  async markSolution(
    topicId: string,
    replyId: string,
    userId: string
  ): Promise<Result<ForumTopic>> {
    try {
      // Update topic
      const topicResult = await this.updateTopic(topicId, {
        solutionReplyId: replyId,
        solvedAt: new Date(),
        solvedBy: userId,
        status: TopicStatus.SOLVED,
      });

      if (topicResult.isFailure) {
        return topicResult;
      }

      // Update reply
      await this.updateReply(replyId, { isSolution: true });

      return topicResult;
    } catch (error) {
      return Result.fail(`Çözüm işaretlenemedi: ${error}`);
    }
  }

  async unmarkSolution(topicId: string): Promise<Result<ForumTopic>> {
    try {
      // Get topic to find solution reply
      const topicResult = await this.findTopicById(topicId);
      if (topicResult.isFailure || !topicResult.value) {
        return Result.fail('Konu bulunamadı');
      }

      const topic = topicResult.value;

      // Update reply if exists
      if (topic.solutionReplyId) {
        await this.updateReply(topic.solutionReplyId, { isSolution: false });
      }

      // Update topic
      return this.updateTopic(topicId, {
        solutionReplyId: null,
        solvedAt: null,
        solvedBy: null,
        status: TopicStatus.OPEN,
      });
    } catch (error) {
      return Result.fail(`Çözüm işareti kaldırılamadı: ${error}`);
    }
  }

  async incrementViewCount(id: string): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase.rpc('increment_forum_topic_view_count', { topic_id: id });

      if (error) {
        // Fallback to manual update if RPC doesn't exist
        const topicResult = await this.findTopicById(id);
        if (topicResult.isSuccess && topicResult.value) {
          await this.updateTopic(id, { viewCount: topicResult.value.viewCount + 1 });
        }
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Görüntülenme sayısı artırılamadı: ${error}`);
    }
  }

  // =====================================================
  // REPLIES
  // =====================================================

  async createReply(
    reply: Omit<ForumReply, 'id' | 'createdAt' | 'updatedAt' | 'likeCount' | 'isEdited'>
  ): Promise<Result<ForumReply>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('forum_replies')
        .insert({
          topic_id: reply.topicId,
          author_id: reply.authorId,
          company_id: reply.companyId,
          parent_id: reply.parentId,
          content: reply.content,
          is_approved: reply.isApproved,
          is_edited: false,
          is_solution: reply.isSolution,
        })
        .select()
        .single();

      if (error) {
        return Result.fail(`Yanıt oluşturulamadı: ${error.message}`);
      }

      return Result.ok(this.mapToReplyEntity(data));
    } catch (error) {
      return Result.fail(`Yanıt oluşturulamadı: ${error}`);
    }
  }

  async findReplyById(id: string): Promise<Result<ForumReply | null>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('forum_replies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(`Yanıt bulunamadı: ${error.message}`);
      }

      return Result.ok(this.mapToReplyEntity(data));
    } catch (error) {
      return Result.fail(`Yanıt bulunamadı: ${error}`);
    }
  }

  async findAllReplies(
    filters: ForumReplyFilters
  ): Promise<Result<{ replies: ForumReplyWithDetails[]; total: number }>> {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase
        .from('forum_replies')
        .select(
          `
          *,
          users!forum_replies_author_id_fkey(id, full_name, email),
          companies(id, name)
        `,
          { count: 'exact' }
        )
        .eq('topic_id', filters.topicId);

      if (filters.parentId !== undefined) {
        if (filters.parentId === null) {
          query = query.is('parent_id', null);
        } else {
          query = query.eq('parent_id', filters.parentId);
        }
      }

      if (filters.authorId) {
        query = query.eq('author_id', filters.authorId);
      }

      if (filters.isApproved !== undefined) {
        query = query.eq('is_approved', filters.isApproved);
      }

      query = query.order('created_at', { ascending: true });

      // Pagination
      if (filters.limit) {
        query = query.range(filters.offset || 0, (filters.offset || 0) + filters.limit - 1);
      }

      const result = await trackSupabaseQuery(
        'ForumRepository.findAllReplies',
        async () => {
          const result = await query;
          return result;
        },
        {
          filters: {
            topicId: filters.topicId,
            parentId: filters.parentId,
            limit: filters.limit,
            offset: filters.offset,
          },
        }
      );
      const { data, error, count } = result;

      if (error) {
        return Result.fail(`Yanıtlar listelenemedi: ${error.message}`);
      }

      const replies: ForumReplyWithDetails[] = (data || []).map((item: any) => ({
        ...this.mapToReplyEntity(item),
        authorName: item.users?.full_name,
        authorEmail: item.users?.email,
        companyName: item.companies?.name,
        replies: [], // Will be populated if needed
      }));

      return Result.ok({
        replies,
        total: count || 0,
      });
    } catch (error) {
      return Result.fail(`Yanıtlar listelenemedi: ${error}`);
    }
  }

  async updateReply(id: string, reply: Partial<ForumReply>): Promise<Result<ForumReply>> {
    try {
      const supabase = await this.getSupabaseClient();

      const updateData: any = {};
      if (reply.content !== undefined) {
        updateData.content = reply.content;
        updateData.is_edited = true;
      }
      if (reply.isApproved !== undefined) updateData.is_approved = reply.isApproved;
      if (reply.isSolution !== undefined) updateData.is_solution = reply.isSolution;

      const { data, error } = await supabase
        .from('forum_replies')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return Result.fail(`Yanıt güncellenemedi: ${error.message}`);
      }

      return Result.ok(this.mapToReplyEntity(data));
    } catch (error) {
      return Result.fail(`Yanıt güncellenemedi: ${error}`);
    }
  }

  async deleteReply(id: string): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase.from('forum_replies').delete().eq('id', id);

      if (error) {
        return Result.fail(`Yanıt silinemedi: ${error.message}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Yanıt silinemedi: ${error}`);
    }
  }

  async approveReply(id: string): Promise<Result<ForumReply>> {
    return this.updateReply(id, { isApproved: true });
  }

  async rejectReply(id: string): Promise<Result<ForumReply>> {
    return this.updateReply(id, { isApproved: false });
  }

  // =====================================================
  // LIKES
  // =====================================================

  async likeTopic(topicId: string, userId: string): Promise<Result<ForumLike>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('forum_likes')
        .insert({
          topic_id: topicId,
          reply_id: null,
          user_id: userId,
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

  async unlikeTopic(topicId: string, userId: string): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase
        .from('forum_likes')
        .delete()
        .eq('topic_id', topicId)
        .eq('user_id', userId);

      if (error) {
        return Result.fail(`Beğeni kaldırılamadı: ${error.message}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Beğeni kaldırılamadı: ${error}`);
    }
  }

  async likeReply(replyId: string, userId: string): Promise<Result<ForumLike>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('forum_likes')
        .insert({
          topic_id: null,
          reply_id: replyId,
          user_id: userId,
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

  async unlikeReply(replyId: string, userId: string): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase
        .from('forum_likes')
        .delete()
        .eq('reply_id', replyId)
        .eq('user_id', userId);

      if (error) {
        return Result.fail(`Beğeni kaldırılamadı: ${error.message}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Beğeni kaldırılamadı: ${error}`);
    }
  }

  async isTopicLikedByUser(topicId: string, userId: string): Promise<Result<boolean>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('forum_likes')
        .select('id')
        .eq('topic_id', topicId)
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

  async isReplyLikedByUser(replyId: string, userId: string): Promise<Result<boolean>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('forum_likes')
        .select('id')
        .eq('reply_id', replyId)
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
  // NOTIFICATIONS
  // =====================================================

  async createNotification(
    notification: Omit<ForumNotification, 'id' | 'createdAt' | 'isRead' | 'readAt'>
  ): Promise<Result<ForumNotification>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('forum_notifications')
        .insert({
          user_id: notification.userId,
          topic_id: notification.topicId,
          reply_id: notification.replyId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
        })
        .select()
        .single();

      if (error) {
        return Result.fail(`Bildirim oluşturulamadı: ${error.message}`);
      }

      return Result.ok(this.mapToNotificationEntity(data));
    } catch (error) {
      return Result.fail(`Bildirim oluşturulamadı: ${error}`);
    }
  }

  async getUserNotifications(
    userId: string,
    unreadOnly?: boolean
  ): Promise<Result<ForumNotification[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase
        .from('forum_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;

      if (error) {
        return Result.fail(`Bildirimler listelenemedi: ${error.message}`);
      }

      return Result.ok(data.map(this.mapToNotificationEntity));
    } catch (error) {
      return Result.fail(`Bildirimler listelenemedi: ${error}`);
    }
  }

  async markNotificationAsRead(id: string): Promise<Result<ForumNotification>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('forum_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return Result.fail(`Bildirim okundu olarak işaretlenemedi: ${error.message}`);
      }

      return Result.ok(this.mapToNotificationEntity(data));
    } catch (error) {
      return Result.fail(`Bildirim okundu olarak işaretlenemedi: ${error}`);
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase
        .from('forum_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        return Result.fail(`Bildirimler okundu olarak işaretlenemedi: ${error.message}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Bildirimler okundu olarak işaretlenemedi: ${error}`);
    }
  }

  async deleteNotification(id: string): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase.from('forum_notifications').delete().eq('id', id);

      if (error) {
        return Result.fail(`Bildirim silinemedi: ${error.message}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Bildirim silinemedi: ${error}`);
    }
  }

  // =====================================================
  // ACTIVITY
  // =====================================================

  async getActivity(
    userId?: string,
    companyId?: string,
    programId?: string
  ): Promise<Result<ForumActivity[]>> {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase.from('forum_activity').select('*');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      if (programId) {
        query = query.eq('program_id', programId);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        return Result.fail(`Aktiviteler listelenemedi: ${error.message}`);
      }

      return Result.ok(data.map(this.mapToActivityEntity));
    } catch (error) {
      return Result.fail(`Aktiviteler listelenemedi: ${error}`);
    }
  }

  async getActivityStats(
    companyId: string,
    programId?: string
  ): Promise<
    Result<{
      totalPoints: number;
      topicsCreated: number;
      repliesCreated: number;
      solutionsMarked: number;
    }>
  > {
    try {
      const activityResult = await this.getActivity(undefined, companyId, programId);
      if (activityResult.isFailure) {
        return Result.fail(activityResult.error || 'İstatistikler alınamadı');
      }

      const activities = activityResult.value;

      const totalPoints = activities.reduce((sum, a) => sum + a.points, 0);
      const topicsCreated = activities.filter((a) => a.activityType === 'topic_created').length;
      const repliesCreated = activities.filter((a) => a.activityType === 'reply_created').length;
      const solutionsMarked = activities.filter((a) => a.activityType === 'solution_marked').length;

      return Result.ok({
        totalPoints,
        topicsCreated,
        repliesCreated,
        solutionsMarked,
      });
    } catch (error) {
      return Result.fail(`İstatistikler alınamadı: ${error}`);
    }
  }

  // =====================================================
  // STATISTICS
  // =====================================================

  async getCategoryStatistics(categoryId: string): Promise<
    Result<{
      topicCount: number;
      replyCount: number;
      totalViews: number;
      totalLikes: number;
    }>
  > {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('forum_topics')
        .select('view_count, reply_count, like_count')
        .eq('category_id', categoryId);

      if (error) {
        return Result.fail(`İstatistikler alınamadı: ${error.message}`);
      }

      const topicCount = data.length;
      const replyCount = data.reduce((sum, t) => sum + (t.reply_count || 0), 0);
      const totalViews = data.reduce((sum, t) => sum + (t.view_count || 0), 0);
      const totalLikes = data.reduce((sum, t) => sum + (t.like_count || 0), 0);

      return Result.ok({
        topicCount,
        replyCount,
        totalViews,
        totalLikes,
      });
    } catch (error) {
      return Result.fail(`İstatistikler alınamadı: ${error}`);
    }
  }

  async getTopicStatistics(topicId: string): Promise<
    Result<{
      viewCount: number;
      replyCount: number;
      likeCount: number;
      solutionCount: number;
    }>
  > {
    try {
      const topicResult = await this.findTopicById(topicId);
      if (topicResult.isFailure || !topicResult.value) {
        return Result.fail('Konu bulunamadı');
      }

      const topic = topicResult.value;

      const repliesResult = await this.findAllReplies({ topicId });
      const solutionCount = repliesResult.isSuccess
        ? repliesResult.value.replies.filter((r) => r.isSolution).length
        : 0;

      return Result.ok({
        viewCount: topic.viewCount,
        replyCount: topic.replyCount,
        likeCount: topic.likeCount,
        solutionCount,
      });
    } catch (error) {
      return Result.fail(`İstatistikler alınamadı: ${error}`);
    }
  }

  // =====================================================
  // MAPPING METHODS
  // =====================================================

  private mapToCategoryEntity(data: any): ForumCategory {
    return {
      id: data.id,
      programId: data.program_id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      icon: data.icon,
      color: data.color,
      orderIndex: data.order_index,
      isActive: data.is_active,
      requireApproval: data.require_approval,
      topicCount: data.topic_count,
      replyCount: data.reply_count,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by,
    };
  }

  private mapToTopicEntity(data: any): ForumTopic {
    return {
      id: data.id,
      categoryId: data.category_id,
      programId: data.program_id,
      authorId: data.author_id,
      companyId: data.company_id,
      title: data.title,
      slug: data.slug,
      content: data.content,
      status: data.status as TopicStatus,
      priority: data.priority as TopicPriority,
      isPinned: data.is_pinned,
      isLocked: data.is_locked,
      isApproved: data.is_approved,
      solutionReplyId: data.solution_reply_id,
      solvedAt: data.solved_at ? new Date(data.solved_at) : null,
      solvedBy: data.solved_by,
      viewCount: data.view_count,
      replyCount: data.reply_count,
      likeCount: data.like_count,
      lastReplyAt: data.last_reply_at ? new Date(data.last_reply_at) : null,
      lastReplyBy: data.last_reply_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapToReplyEntity(data: any): ForumReply {
    return {
      id: data.id,
      topicId: data.topic_id,
      authorId: data.author_id,
      companyId: data.company_id,
      parentId: data.parent_id,
      content: data.content,
      isApproved: data.is_approved,
      isEdited: data.is_edited,
      isSolution: data.is_solution,
      likeCount: data.like_count,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapToLikeEntity(data: any): ForumLike {
    return {
      id: data.id,
      topicId: data.topic_id,
      replyId: data.reply_id,
      userId: data.user_id,
      createdAt: new Date(data.created_at),
    };
  }

  private mapToNotificationEntity(data: any): ForumNotification {
    return {
      id: data.id,
      userId: data.user_id,
      topicId: data.topic_id,
      replyId: data.reply_id,
      type: data.type,
      title: data.title,
      message: data.message,
      isRead: data.is_read,
      readAt: data.read_at ? new Date(data.read_at) : null,
      createdAt: new Date(data.created_at),
    };
  }

  private mapToActivityEntity(data: any): ForumActivity {
    return {
      id: data.id,
      userId: data.user_id,
      companyId: data.company_id,
      programId: data.program_id,
      activityType: data.activity_type,
      topicId: data.topic_id,
      replyId: data.reply_id,
      points: data.points,
      createdAt: new Date(data.created_at),
    };
  }
}
