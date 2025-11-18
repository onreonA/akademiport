/**
 * Chatbot Chat API Route (Streaming)
 *
 * POST /api/chatbot/chat
 * Chatbot mesajı gönder ve streaming response al
 */

import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { ChatbotConversationUseCase } from '@/2-application/use-cases/chatbot/ChatbotConversationUseCase';
import { SupabaseChatbotRepository } from '@/4-infrastructure/database/repositories/SupabaseChatbotRepository';
import { TrainingRepository } from '@/4-infrastructure/database/repositories/TrainingRepository';
import { AIRouterService } from '@/5-shared/services/ai/ai-router.service';
import { PromptManagerService } from '@/5-shared/services/ai/prompt-manager.service';
import { TokenTrackerService } from '@/5-shared/services/ai/token-tracker.service';
import { logger } from '@/5-shared/utils/logger';
import { AIUseCase } from '@/3-domain/enums/AIEnums';

/**
 * Streaming response için Server-Sent Events (SSE) kullanıyoruz
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { conversationId, message, companyId, programId, context, stream = false } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Mesaj gereklidir' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize dependencies
    const chatbotRepository = new SupabaseChatbotRepository();
    const trainingRepository = new TrainingRepository();
    const aiRouter = new AIRouterService();
    const promptManager = new PromptManagerService();
    const tokenTracker = new TokenTrackerService();

    // Create use case
    const useCase = new ChatbotConversationUseCase(
      chatbotRepository,
      trainingRepository,
      aiRouter,
      promptManager,
      tokenTracker
    );

    // Streaming isteniyorsa
    if (stream) {
      return handleStreamingResponse(request, useCase, {
        conversationId,
        message,
        userId: user.id,
        companyId: user.companyId || companyId,
        programId,
        context,
      });
    }

    // Normal (non-streaming) response
    const result = await useCase.sendMessage({
      conversationId,
      message,
      userId: user.id,
      companyId: user.companyId || companyId,
      programId,
      context,
    });

    if (result.isFailure) {
      logger.error('Chatbot message failed:', result.error);
      return new Response(
        JSON.stringify({
          error: result.error?.message || 'Mesaj gönderilemedi',
          code: (result.error as any)?.code || undefined,
        }),
        {
          status: (result.error as any)?.statusCode || 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result.value,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    logger.error('Error in chatbot chat API:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Streaming response handler (SSE)
 */
async function handleStreamingResponse(
  request: NextRequest,
  useCase: ChatbotConversationUseCase,
  dto: {
    conversationId?: string;
    message: string;
    userId: string;
    companyId?: string | null;
    programId?: string | null;
    context?: Record<string, any>;
  }
) {
  const encoder = new TextEncoder();

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 1. Konuşmayı bul veya oluştur (use case içinde yapılacak ama önce konuşma ID'sine ihtiyacımız var)
        const chatbotRepository = new SupabaseChatbotRepository();
        let conversationId = dto.conversationId;

        if (!conversationId) {
          const createResult = await chatbotRepository.createConversation({
            userId: dto.userId,
            companyId: dto.companyId,
            programId: dto.programId,
            context: dto.context || {},
          });

          if (createResult.isFailure) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: 'Konuşma oluşturulamadı' })}\n\n`)
            );
            controller.close();
            return;
          }

          conversationId = createResult.value.id;
        }

        // 2. Kullanıcı mesajını kaydet
        const userMessageResult = await chatbotRepository.createMessage({
          conversationId,
          role: 'user',
          content: dto.message,
        });

        if (userMessageResult.isFailure) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Mesaj kaydedilemedi' })}\n\n`)
          );
          controller.close();
          return;
        }

        // 3. Konuşma geçmişini al
        const historyResult = await chatbotRepository.findMessagesByConversationId(
          conversationId,
          20,
          0
        );

        const messages = historyResult.isSuccess ? historyResult.value.data : [];

        // 4. Prompt template'i al
        const promptManager = new PromptManagerService();
        const promptResult = await promptManager.getActivePrompt(AIUseCase.CHATBOT);

        if (promptResult.isFailure || !promptResult.value) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Prompt template bulunamadı' })}\n\n`)
          );
          controller.close();
          return;
        }

        const prompt = promptResult.value;

        // 5. Context bilgilerini hazırla
        const conversationResult = await chatbotRepository.findConversationById(conversationId);
        const conversation = conversationResult.isSuccess ? conversationResult.value : null;

        const context: Record<string, any> = {
          ...(conversation?.context || {}),
          ...(dto.context || {}),
          userId: dto.userId,
          companyId: dto.companyId,
          programId: dto.programId,
        };

        // 6. System prompt oluştur
        let systemPrompt = promptManager.renderPrompt(prompt, {
          user_id: context.userId || 'Bilinmiyor',
          company_id: context.companyId || 'Yok',
          program_id: context.programId || 'Yok',
        });

        if (messages.length > 0) {
          const conversationHistory = messages
            .map((msg) => `${msg.role === 'user' ? 'Kullanıcı' : 'Asistan'}: ${msg.content}`)
            .join('\n');
          systemPrompt += `\n\n## Konuşma Geçmişi:\n${conversationHistory}\n\n`;
        }

        // 7. AI streaming
        const aiRouter = new AIRouterService();
        let fullResponse = '';

        const aiResult = await aiRouter.stream(
          AIUseCase.CHATBOT,
          systemPrompt,
          {
            temperature: prompt.temperature || 0.7,
            maxTokens: prompt.maxTokens || 2000,
            topP: prompt.topP || 1.0,
          },
          (chunk: string) => {
            // Her chunk geldiğinde SSE olarak gönder
            fullResponse += chunk;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`)
            );
          }
        );

        if (aiResult.isFailure) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'error', error: aiResult.error?.message })}\n\n`
            )
          );
          controller.close();
          return;
        }

        const aiResponse = aiResult.value;

        // 8. Assistant mesajını kaydet
        await chatbotRepository.createMessage({
          conversationId,
          role: 'assistant',
          content: fullResponse,
          tokensUsed: aiResponse.totalTokens || 0,
          costUsd: aiResponse.costUsd || 0,
        });

        // 9. Konuşmayı güncelle
        await chatbotRepository.updateConversation(conversationId, {
          lastMessageAt: new Date(),
        });

        // 10. Final message
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'done', conversationId, message: fullResponse })}\n\n`
          )
        );
        controller.close();
      } catch (error) {
        logger.error('Error in streaming handler:', error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
