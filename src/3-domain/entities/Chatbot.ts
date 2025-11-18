/**
 * Chatbot Entities
 *
 * Chatbot konuşmaları ve mesajları için domain entities
 */

export type ChatbotMessageRole = 'user' | 'assistant' | 'system';
export type ChatbotIntent =
  | 'training'
  | 'project'
  | 'task'
  | 'ecommerce'
  | 'forum'
  | 'news'
  | 'appointment'
  | 'event'
  | 'general'
  | 'unknown';

export interface ChatbotConversation {
  id: string;
  userId: string;
  companyId: string | null;
  programId: string | null;
  title: string | null;
  context: Record<string, any>; // Context bilgileri
  messageCount: number;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatbotMessage {
  id: string;
  conversationId: string;
  role: ChatbotMessageRole;
  content: string;
  intent: ChatbotIntent | null;
  metadata: Record<string, any>; // Additional metadata
  tokensUsed: number;
  costUsd: number;
  createdAt: Date;
}

export interface CreateChatbotConversationDto {
  userId: string;
  companyId?: string | null;
  programId?: string | null;
  title?: string | null;
  context?: Record<string, any>;
}

export interface CreateChatbotMessageDto {
  conversationId: string;
  role: ChatbotMessageRole;
  content: string;
  intent?: ChatbotIntent | null;
  metadata?: Record<string, any>;
  tokensUsed?: number;
  costUsd?: number;
}

export interface ChatbotConversationWithMessages extends ChatbotConversation {
  messages: ChatbotMessage[];
}

/**
 * Chatbot Conversation Entity with Business Logic
 */
export class ChatbotConversationEntity implements ChatbotConversation {
  id!: string;
  userId!: string;
  companyId!: string | null;
  programId!: string | null;
  title!: string | null;
  context!: Record<string, any>;
  messageCount!: number;
  lastMessageAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: ChatbotConversation) {
    Object.assign(this, data);
  }

  /**
   * Konuşma başlığını güncelle
   */
  updateTitle(title: string): void {
    if (title && title.length > 0) {
      this.title = title.length > 255 ? title.substring(0, 255) : title;
      this.touch();
    }
  }

  /**
   * Context'i güncelle
   */
  updateContext(context: Record<string, any>): void {
    this.context = { ...this.context, ...context };
    this.touch();
  }

  /**
   * Mesaj sayısını artır
   */
  incrementMessageCount(): void {
    this.messageCount += 1;
    this.lastMessageAt = new Date();
    this.touch();
  }

  /**
   * UpdatedAt'i güncelle
   */
  private touch(): void {
    this.updatedAt = new Date();
  }

  /**
   * Konuşma boş mu?
   */
  isEmpty(): boolean {
    return this.messageCount === 0;
  }

  /**
   * Son aktivite ne zaman?
   */
  getLastActivity(): Date {
    return this.lastMessageAt || this.createdAt;
  }
}

/**
 * Chatbot Message Entity with Business Logic
 */
export class ChatbotMessageEntity implements ChatbotMessage {
  id!: string;
  conversationId!: string;
  role!: ChatbotMessageRole;
  content!: string;
  intent!: ChatbotIntent | null;
  metadata!: Record<string, any>;
  tokensUsed!: number;
  costUsd!: number;
  createdAt!: Date;

  constructor(data: ChatbotMessage) {
    Object.assign(this, data);
  }

  /**
   * Intent'i güncelle
   */
  setIntent(intent: ChatbotIntent): void {
    this.intent = intent;
  }

  /**
   * Metadata ekle
   */
  addMetadata(key: string, value: any): void {
    this.metadata = { ...this.metadata, [key]: value };
  }

  /**
   * Token kullanımını kaydet
   */
  recordTokenUsage(tokens: number, costUsd: number): void {
    this.tokensUsed = tokens;
    this.costUsd = costUsd;
  }

  /**
   * Kullanıcı mesajı mı?
   */
  isUserMessage(): boolean {
    return this.role === 'user';
  }

  /**
   * Assistant mesajı mı?
   */
  isAssistantMessage(): boolean {
    return this.role === 'assistant';
  }
}
