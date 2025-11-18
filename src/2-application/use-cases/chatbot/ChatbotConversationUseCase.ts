/**
 * Chatbot Conversation Use Case
 *
 * Chatbot konuşmalarını yönetir ve AI ile mesaj alışverişi yapar
 */

import { Result } from '@/6-core/result/Result';
import { IAIRouter } from '@/3-domain/interfaces/services/IAIRouter';
import { IPromptManager } from '@/3-domain/interfaces/services/IPromptManager';
import { ITokenTracker } from '@/3-domain/interfaces/services/ITokenTracker';
import { IChatbotRepository } from '@/3-domain/interfaces/repositories/IChatbotRepository';
import { ITrainingRepository } from '@/3-domain/interfaces/repositories/ITrainingRepository';
import { AIUseCase } from '@/3-domain/enums/AIEnums';
import { logger } from '@/5-shared/utils/logger';
import { AppError } from '@/6-core/errors/AppError';
import {
  ChatbotConversation,
  ChatbotMessage,
  ChatbotIntent,
  CreateChatbotConversationDto,
} from '@/3-domain/entities/Chatbot';

export interface SendChatbotMessageDto {
  conversationId?: string; // Yeni konuşma için boş bırakılabilir
  message: string;
  userId: string;
  companyId?: string | null;
  programId?: string | null;
  context?: Record<string, any>; // Ek context bilgileri
}

export interface ChatbotResponse {
  conversation: ChatbotConversation;
  message: ChatbotMessage;
  assistantMessage: ChatbotMessage;
}

export class ChatbotConversationUseCase {
  constructor(
    private chatbotRepository: IChatbotRepository,
    private trainingRepository: ITrainingRepository,
    private aiRouter: IAIRouter,
    private promptManager: IPromptManager,
    private tokenTracker: ITokenTracker
  ) {}

  /**
   * Mesaj gönder ve AI yanıtı al
   */
  async sendMessage(dto: SendChatbotMessageDto): Promise<Result<ChatbotResponse>> {
    try {
      // 1. Konuşmayı bul veya oluştur
      let conversation: ChatbotConversation;

      if (dto.conversationId) {
        const conversationResult = await this.chatbotRepository.findConversationById(
          dto.conversationId
        );
        if (conversationResult.isFailure || !conversationResult.value) {
          return Result.fail(new AppError('Konuşma bulunamadı', 404));
        }
        conversation = conversationResult.value;
      } else {
        // Yeni konuşma oluştur
        const createResult = await this.chatbotRepository.createConversation({
          userId: dto.userId,
          companyId: dto.companyId,
          programId: dto.programId,
          context: dto.context || {},
        });

        if (createResult.isFailure) {
          return Result.fail(new AppError(`Konuşma oluşturulamadı: ${createResult.error}`, 500));
        }

        conversation = createResult.value;
      }

      // 2. Kullanıcı mesajını kaydet
      const userMessageResult = await this.chatbotRepository.createMessage({
        conversationId: conversation.id,
        role: 'user',
        content: dto.message,
        intent: this.detectIntent(dto.message),
      });

      if (userMessageResult.isFailure) {
        return Result.fail(new AppError(`Mesaj kaydedilemedi: ${userMessageResult.error}`, 500));
      }

      const userMessage = userMessageResult.value;

      // 3. Konuşma geçmişini al (son 20 mesaj)
      const historyResult = await this.chatbotRepository.findMessagesByConversationId(
        conversation.id,
        20,
        0
      );

      if (historyResult.isFailure) {
        return Result.fail(new AppError(`Konuşma geçmişi alınamadı: ${historyResult.error}`, 500));
      }

      const messages = historyResult.value.data;

      // 4. Prompt template'i al
      const promptResult = await this.promptManager.getActivePrompt(AIUseCase.CHATBOT);
      if (promptResult.isFailure || !promptResult.value) {
        return Result.fail(
          new AppError(
            'Chatbot prompt template bulunamadı. Lütfen admin panelinden prompt oluşturun.',
            404
          )
        );
      }

      const prompt = promptResult.value;

      // 5. Context bilgilerini hazırla
      const contextInfo = await this.buildContext(conversation, dto);

      // 6. Prompt'u render et
      const systemPrompt = this.buildSystemPrompt(prompt.template, contextInfo, messages);

      // 7. AI'a gönder (streaming olmadan, normal completion)
      const aiResult = await this.aiRouter.complete(AIUseCase.CHATBOT, systemPrompt, {
        temperature: prompt.temperature || 0.7,
        maxTokens: prompt.maxTokens || 2000,
        topP: prompt.topP || 1.0,
        metadata: {
          conversationId: conversation.id,
          userId: dto.userId,
          companyId: dto.companyId,
          programId: dto.programId,
        },
      });

      if (aiResult.isFailure) {
        logger.error('AI chatbot response failed:', aiResult.error);
        return Result.fail(
          new AppError(`AI yanıtı alınamadı: ${aiResult.error?.message || 'Bilinmeyen hata'}`, 500)
        );
      }

      const aiResponse = aiResult.value;
      const assistantContent =
        typeof aiResponse === 'string'
          ? aiResponse
          : (aiResponse as any)?.text || JSON.stringify(aiResponse);

      // 8. Assistant mesajını kaydet
      const assistantMessageResult = await this.chatbotRepository.createMessage({
        conversationId: conversation.id,
        role: 'assistant',
        content: assistantContent,
        intent: this.detectIntent(dto.message), // Kullanıcı mesajının intent'ini kullan
        tokensUsed: aiResponse.totalTokens || 0,
        costUsd: aiResponse.costUsd || 0,
      });

      if (assistantMessageResult.isFailure) {
        return Result.fail(
          new AppError(`Assistant mesajı kaydedilemedi: ${assistantMessageResult.error}`, 500)
        );
      }

      // 9. Token tracking (AI router zaten logluyor ama ekstra tracking için)
      if (aiResponse.totalTokens) {
        // Token tracking is handled by AI router service
      }

      // 10. Konuşmayı güncelle
      await this.chatbotRepository.updateConversation(conversation.id, {
        lastMessageAt: new Date(),
      });

      logger.info('Chatbot message sent successfully', {
        conversationId: conversation.id,
        userId: dto.userId,
        messageLength: dto.message.length,
      });

      return Result.ok({
        conversation,
        message: userMessage,
        assistantMessage: assistantMessageResult.value,
      });
    } catch (error) {
      logger.error('Error in ChatbotConversationUseCase:', error);
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Chatbot mesajı gönderilemedi', 500)
      );
    }
  }

  /**
   * Context bilgilerini oluştur
   */
  private async buildContext(
    conversation: ChatbotConversation,
    dto: SendChatbotMessageDto
  ): Promise<Record<string, any>> {
    const context: Record<string, any> = {
      ...conversation.context,
      ...(dto.context || {}),
      userId: dto.userId,
      companyId: dto.companyId,
      programId: dto.programId,
    };

    // Eğitim içeriği varsa ekle
    if (dto.programId) {
      try {
        const trainingsResult = await this.trainingRepository.findByProgramId(dto.programId);
        if (trainingsResult && trainingsResult.length > 0) {
          context.availableTrainings = trainingsResult.map((t) => ({
            id: t.id,
            name: t.name,
            description: t.description,
          }));
        }
      } catch (error) {
        logger.warn('Failed to fetch trainings for context:', error);
      }
    }

    return context;
  }

  /**
   * System prompt oluştur
   */
  private buildSystemPrompt(
    template: string,
    context: Record<string, any>,
    messages: ChatbotMessage[]
  ): string {
    // Template'i render et
    let systemPrompt = this.promptManager.renderPrompt(template, {
      user_id: context.userId || 'Bilinmiyor',
      company_id: context.companyId || 'Yok',
      program_id: context.programId || 'Yok',
      available_trainings: context.availableTrainings
        ? JSON.stringify(context.availableTrainings)
        : 'Yok',
    });

    // Konuşma geçmişini ekle
    if (messages.length > 0) {
      const conversationHistory = messages
        .map((msg) => `${msg.role === 'user' ? 'Kullanıcı' : 'Asistan'}: ${msg.content}`)
        .join('\n');

      systemPrompt += `\n\n## Konuşma Geçmişi:\n${conversationHistory}\n\n`;
    }

    return systemPrompt;
  }

  /**
   * Basit intent detection (keyword-based)
   */
  private detectIntent(message: string): ChatbotIntent {
    const lowerMessage = message.toLowerCase();

    // Training keywords
    if (
      lowerMessage.includes('eğitim') ||
      lowerMessage.includes('training') ||
      lowerMessage.includes('video') ||
      lowerMessage.includes('döküman') ||
      lowerMessage.includes('öğren')
    ) {
      return 'training';
    }

    // Project keywords
    if (
      lowerMessage.includes('proje') ||
      lowerMessage.includes('project') ||
      lowerMessage.includes('görev') ||
      lowerMessage.includes('task')
    ) {
      return 'project';
    }

    // E-commerce keywords
    if (
      lowerMessage.includes('e-ticaret') ||
      lowerMessage.includes('ecommerce') ||
      lowerMessage.includes('satış') ||
      lowerMessage.includes('gelir')
    ) {
      return 'ecommerce';
    }

    // Forum keywords
    if (
      lowerMessage.includes('forum') ||
      lowerMessage.includes('soru') ||
      lowerMessage.includes('cevap')
    ) {
      return 'forum';
    }

    // News keywords
    if (lowerMessage.includes('haber') || lowerMessage.includes('news')) {
      return 'news';
    }

    // Appointment keywords
    if (
      lowerMessage.includes('randevu') ||
      lowerMessage.includes('appointment') ||
      lowerMessage.includes('görüşme')
    ) {
      return 'appointment';
    }

    // Event keywords
    if (
      lowerMessage.includes('etkinlik') ||
      lowerMessage.includes('event') ||
      lowerMessage.includes('toplantı')
    ) {
      return 'event';
    }

    return 'general';
  }
}
