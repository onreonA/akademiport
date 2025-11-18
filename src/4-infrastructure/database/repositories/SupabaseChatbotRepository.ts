/**
 * Supabase Chatbot Repository Implementation
 *
 * Chatbot konuşmaları ve mesajları için Supabase repository implementasyonu
 */

import { createClient, getSupabaseAdminClient } from '@/4-infrastructure/database/supabase-server';
import { Result } from '@/6-core/result/Result';
import {
  IChatbotRepository,
  ChatbotConversationFilters,
} from '@/3-domain/interfaces/repositories/IChatbotRepository';
import {
  ChatbotConversation,
  ChatbotMessage,
  CreateChatbotConversationDto,
  CreateChatbotMessageDto,
  ChatbotConversationWithMessages,
} from '@/3-domain/entities/Chatbot';

export class SupabaseChatbotRepository implements IChatbotRepository {
  private async getSupabaseClient() {
    // In test environment, use admin client to bypass RLS
    if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
      return getSupabaseAdminClient();
    }
    return await createClient();
  }

  // =====================================================
  // CONVERSATIONS
  // =====================================================

  async createConversation(
    dto: CreateChatbotConversationDto
  ): Promise<Result<ChatbotConversation>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('chatbot_conversations')
        .insert({
          user_id: dto.userId,
          company_id: dto.companyId || null,
          program_id: dto.programId || null,
          title: dto.title || null,
          context: dto.context || {},
          message_count: 0,
          last_message_at: null,
        })
        .select()
        .single();

      if (error) {
        return Result.fail(`Konuşma oluşturulamadı: ${error.message}`);
      }

      return Result.ok(this.mapToConversationEntity(data));
    } catch (error) {
      return Result.fail(`Konuşma oluşturulamadı: ${error}`);
    }
  }

  async findConversationById(id: string): Promise<Result<ChatbotConversation | null>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('chatbot_conversations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(`Konuşma bulunamadı: ${error.message}`);
      }

      return Result.ok(this.mapToConversationEntity(data));
    } catch (error) {
      return Result.fail(`Konuşma bulunamadı: ${error}`);
    }
  }

  async findConversations(
    filters?: ChatbotConversationFilters
  ): Promise<Result<{ data: ChatbotConversation[]; total: number }>> {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase.from('chatbot_conversations').select('*', { count: 'exact' });

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters?.companyId) {
        query = query.eq('company_id', filters.companyId);
      }
      if (filters?.programId) {
        query = query.eq('program_id', filters.programId);
      }

      query = query.order('last_message_at', { ascending: false, nullsFirst: false });

      const limit = filters?.limit || 50;
      const offset = filters?.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        return Result.fail(`Konuşmalar listelenemedi: ${error.message}`);
      }

      const conversations = (data || []).map((item) => this.mapToConversationEntity(item));

      return Result.ok({
        data: conversations,
        total: count || 0,
      });
    } catch (error) {
      return Result.fail(`Konuşmalar listelenemedi: ${error}`);
    }
  }

  async findUserConversations(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<Result<{ data: ChatbotConversation[]; total: number }>> {
    return this.findConversations({ userId, limit, offset });
  }

  async updateConversation(
    id: string,
    updates: Partial<ChatbotConversation>
  ): Promise<Result<ChatbotConversation>> {
    try {
      const supabase = await this.getSupabaseClient();

      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.context !== undefined) updateData.context = updates.context;
      if (updates.messageCount !== undefined) updateData.message_count = updates.messageCount;
      if (updates.lastMessageAt !== undefined)
        updateData.last_message_at = updates.lastMessageAt?.toISOString() || null;
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('chatbot_conversations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return Result.fail(`Konuşma güncellenemedi: ${error.message}`);
      }

      return Result.ok(this.mapToConversationEntity(data));
    } catch (error) {
      return Result.fail(`Konuşma güncellenemedi: ${error}`);
    }
  }

  async deleteConversation(id: string): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase.from('chatbot_conversations').delete().eq('id', id);

      if (error) {
        return Result.fail(`Konuşma silinemedi: ${error.message}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Konuşma silinemedi: ${error}`);
    }
  }

  // =====================================================
  // MESSAGES
  // =====================================================

  async createMessage(dto: CreateChatbotMessageDto): Promise<Result<ChatbotMessage>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('chatbot_messages')
        .insert({
          conversation_id: dto.conversationId,
          role: dto.role,
          content: dto.content,
          intent: dto.intent || null,
          metadata: dto.metadata || {},
          tokens_used: dto.tokensUsed || 0,
          cost_usd: dto.costUsd || 0,
        })
        .select()
        .single();

      if (error) {
        return Result.fail(`Mesaj oluşturulamadı: ${error.message}`);
      }

      return Result.ok(this.mapToMessageEntity(data));
    } catch (error) {
      return Result.fail(`Mesaj oluşturulamadı: ${error}`);
    }
  }

  async findMessageById(id: string): Promise<Result<ChatbotMessage | null>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('chatbot_messages')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(`Mesaj bulunamadı: ${error.message}`);
      }

      return Result.ok(this.mapToMessageEntity(data));
    } catch (error) {
      return Result.fail(`Mesaj bulunamadı: ${error}`);
    }
  }

  async findMessagesByConversationId(
    conversationId: string,
    limit = 100,
    offset = 0
  ): Promise<Result<{ data: ChatbotMessage[]; total: number }>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error, count } = await supabase
        .from('chatbot_messages')
        .select('*', { count: 'exact' })
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        return Result.fail(`Mesajlar listelenemedi: ${error.message}`);
      }

      const messages = (data || []).map((item) => this.mapToMessageEntity(item));

      return Result.ok({
        data: messages,
        total: count || 0,
      });
    } catch (error) {
      return Result.fail(`Mesajlar listelenemedi: ${error}`);
    }
  }

  async findConversationWithMessages(
    conversationId: string
  ): Promise<Result<ChatbotConversationWithMessages | null>> {
    try {
      const conversationResult = await this.findConversationById(conversationId);
      if (conversationResult.isFailure || !conversationResult.value) {
        return Result.ok(null);
      }

      const messagesResult = await this.findMessagesByConversationId(conversationId, 1000, 0);
      if (messagesResult.isFailure) {
        return Result.fail(messagesResult.error || 'Mesajlar alınamadı');
      }

      return Result.ok({
        ...conversationResult.value,
        messages: messagesResult.value.data,
      });
    } catch (error) {
      return Result.fail(`Konuşma ve mesajlar getirilemedi: ${error}`);
    }
  }

  async updateMessage(
    id: string,
    updates: Partial<ChatbotMessage>
  ): Promise<Result<ChatbotMessage>> {
    try {
      const supabase = await this.getSupabaseClient();

      const updateData: any = {};
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.intent !== undefined) updateData.intent = updates.intent;
      if (updates.metadata !== undefined) updateData.metadata = updates.metadata;
      if (updates.tokensUsed !== undefined) updateData.tokens_used = updates.tokensUsed;
      if (updates.costUsd !== undefined) updateData.cost_usd = updates.costUsd;

      const { data, error } = await supabase
        .from('chatbot_messages')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return Result.fail(`Mesaj güncellenemedi: ${error.message}`);
      }

      return Result.ok(this.mapToMessageEntity(data));
    } catch (error) {
      return Result.fail(`Mesaj güncellenemedi: ${error}`);
    }
  }

  async deleteMessage(id: string): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase.from('chatbot_messages').delete().eq('id', id);

      if (error) {
        return Result.fail(`Mesaj silinemedi: ${error.message}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Mesaj silinemedi: ${error}`);
    }
  }

  async deleteMessagesByConversationId(conversationId: string): Promise<Result<void>> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase
        .from('chatbot_messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (error) {
        return Result.fail(`Mesajlar silinemedi: ${error.message}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Mesajlar silinemedi: ${error}`);
    }
  }

  // =====================================================
  // MAPPING FUNCTIONS
  // =====================================================

  private mapToConversationEntity(data: any): ChatbotConversation {
    return {
      id: data.id,
      userId: data.user_id,
      companyId: data.company_id,
      programId: data.program_id,
      title: data.title,
      context: data.context || {},
      messageCount: data.message_count || 0,
      lastMessageAt: data.last_message_at ? new Date(data.last_message_at) : null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapToMessageEntity(data: any): ChatbotMessage {
    return {
      id: data.id,
      conversationId: data.conversation_id,
      role: data.role,
      content: data.content,
      intent: data.intent,
      metadata: data.metadata || {},
      tokensUsed: data.tokens_used || 0,
      costUsd: parseFloat(data.cost_usd || '0'),
      createdAt: new Date(data.created_at),
    };
  }
}
