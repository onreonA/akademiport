/**
 * Chatbot Repository Interface
 *
 * Chatbot konuşmaları ve mesajları için repository interface
 */

import { Result } from '@/6-core/result/Result';
import {
  ChatbotConversation,
  ChatbotMessage,
  CreateChatbotConversationDto,
  CreateChatbotMessageDto,
  ChatbotConversationWithMessages,
} from '@/3-domain/entities/Chatbot';

export interface ChatbotConversationFilters {
  userId?: string;
  companyId?: string;
  programId?: string;
  limit?: number;
  offset?: number;
}

export interface IChatbotRepository {
  // Conversations
  createConversation(dto: CreateChatbotConversationDto): Promise<Result<ChatbotConversation>>;
  findConversationById(id: string): Promise<Result<ChatbotConversation | null>>;
  findConversations(
    filters?: ChatbotConversationFilters
  ): Promise<Result<{ data: ChatbotConversation[]; total: number }>>;
  findUserConversations(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<Result<{ data: ChatbotConversation[]; total: number }>>;
  updateConversation(
    id: string,
    updates: Partial<ChatbotConversation>
  ): Promise<Result<ChatbotConversation>>;
  deleteConversation(id: string): Promise<Result<void>>;

  // Messages
  createMessage(dto: CreateChatbotMessageDto): Promise<Result<ChatbotMessage>>;
  findMessageById(id: string): Promise<Result<ChatbotMessage | null>>;
  findMessagesByConversationId(
    conversationId: string,
    limit?: number,
    offset?: number
  ): Promise<Result<{ data: ChatbotMessage[]; total: number }>>;
  findConversationWithMessages(
    conversationId: string
  ): Promise<Result<ChatbotConversationWithMessages | null>>;
  updateMessage(id: string, updates: Partial<ChatbotMessage>): Promise<Result<ChatbotMessage>>;
  deleteMessage(id: string): Promise<Result<void>>;
  deleteMessagesByConversationId(conversationId: string): Promise<Result<void>>;
}
