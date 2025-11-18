/**
 * ChatbotConversationUseCase Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChatbotConversationUseCase } from './ChatbotConversationUseCase';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { ChatbotConversation, ChatbotMessage } from '@/3-domain/entities/Chatbot';

// Mock repositories
const mockCreateConversation = vi.fn();
const mockFindConversationById = vi.fn();
const mockCreateMessage = vi.fn();
const mockFindMessagesByConversationId = vi.fn();
const mockUpdateConversation = vi.fn();

const mockChatbotRepository = {
  createConversation: mockCreateConversation,
  findConversationById: mockFindConversationById,
  createMessage: mockCreateMessage,
  findMessagesByConversationId: mockFindMessagesByConversationId,
  updateConversation: mockUpdateConversation,
  findConversations: vi.fn(),
  findUserConversations: vi.fn(),
  deleteConversation: vi.fn(),
  findMessageById: vi.fn(),
  findConversationWithMessages: vi.fn(),
  updateMessage: vi.fn(),
  deleteMessage: vi.fn(),
  deleteMessagesByConversationId: vi.fn(),
};

// Mock training repository
const mockFindByProgramId = vi.fn();
const mockTrainingRepository = {
  findAll: vi.fn(),
  findByProgramId: mockFindByProgramId,
  findById: vi.fn(),
  findByConsultantId: vi.fn(),
  findGlobal: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

// Mock AI router
const mockComplete = vi.fn();
const mockAIRouter = {
  complete: mockComplete,
  stream: vi.fn(),
  selectProvider: vi.fn(),
  checkProviderHealth: vi.fn(),
};

// Mock prompt manager
const mockGetActivePrompt = vi.fn();
const mockRenderPrompt = vi.fn();
const mockPromptManager = {
  getActivePrompt: mockGetActivePrompt,
  renderPrompt: mockRenderPrompt,
  createPrompt: vi.fn(),
  updatePrompt: vi.fn(),
};

// Mock token tracker
const mockTokenTracker = {
  logUsage: vi.fn(),
  trackUsage: vi.fn(),
};

describe('ChatbotConversationUseCase', () => {
  let useCase: ChatbotConversationUseCase;

  beforeEach(() => {
    vi.clearAllMocks();

    useCase = new ChatbotConversationUseCase(
      mockChatbotRepository as any,
      mockTrainingRepository as any,
      mockAIRouter as any,
      mockPromptManager as any,
      mockTokenTracker as any
    );
  });

  describe('sendMessage', () => {
    const mockConversation: ChatbotConversation = {
      id: 'conv-1',
      userId: 'user-1',
      companyId: 'company-1',
      programId: 'program-1',
      title: 'Test Conversation',
      context: {},
      messageCount: 0,
      lastMessageAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockPrompt = {
      id: 'prompt-1',
      name: 'Chatbot Prompt',
      template: 'Template: {{user_id}}',
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1.0,
      version: 1,
    };

    it('should create new conversation and send message successfully', async () => {
      // Mock conversation creation
      mockCreateConversation.mockResolvedValue(Result.ok(mockConversation));

      // Mock message creation
      const mockUserMessage: ChatbotMessage = {
        id: 'msg-1',
        conversationId: 'conv-1',
        role: 'user',
        content: 'Hello',
        intent: 'general',
        metadata: {},
        tokensUsed: 0,
        costUsd: 0,
        createdAt: new Date(),
      };
      mockCreateMessage.mockResolvedValue(Result.ok(mockUserMessage));

      // Mock message history
      mockFindMessagesByConversationId.mockResolvedValue(Result.ok({ data: [], total: 0 }));

      // Mock prompt
      mockGetActivePrompt.mockResolvedValue(Result.ok(mockPrompt));
      mockRenderPrompt.mockReturnValue('Rendered prompt');

      // Mock AI response
      mockComplete.mockResolvedValue(
        Result.ok({
          text: 'Hello! How can I help you?',
          requestTokens: 10,
          responseTokens: 20,
          totalTokens: 30,
          costUsd: 0.001,
          durationMs: 500,
          model: 'gpt-4',
          provider: 'openai',
        })
      );

      // Mock assistant message
      const mockAssistantMessage: ChatbotMessage = {
        id: 'msg-2',
        conversationId: 'conv-1',
        role: 'assistant',
        content: 'Hello! How can I help you?',
        intent: null,
        metadata: {},
        tokensUsed: 30,
        costUsd: 0.001,
        createdAt: new Date(),
      };
      mockCreateMessage.mockResolvedValueOnce(Result.ok(mockUserMessage));
      mockCreateMessage.mockResolvedValueOnce(Result.ok(mockAssistantMessage));

      // Mock conversation update
      mockUpdateConversation.mockResolvedValue(Result.ok(mockConversation));

      const result = await useCase.sendMessage({
        message: 'Hello',
        userId: 'user-1',
        companyId: 'company-1',
        programId: 'program-1',
      });

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.conversation.id).toBe('conv-1');
        expect(result.value.message.content).toBe('Hello');
        expect(result.value.assistantMessage.content).toBe('Hello! How can I help you?');
      }

      expect(mockCreateConversation).toHaveBeenCalled();
      expect(mockCreateMessage).toHaveBeenCalledTimes(2);
      expect(mockComplete).toHaveBeenCalled();
    });

    it('should use existing conversation when conversationId is provided', async () => {
      mockFindConversationById.mockResolvedValue(Result.ok(mockConversation));

      const mockUserMessage: ChatbotMessage = {
        id: 'msg-1',
        conversationId: 'conv-1',
        role: 'user',
        content: 'Hello',
        intent: 'general',
        metadata: {},
        tokensUsed: 0,
        costUsd: 0,
        createdAt: new Date(),
      };
      mockCreateMessage.mockResolvedValue(Result.ok(mockUserMessage));

      mockFindMessagesByConversationId.mockResolvedValue(Result.ok({ data: [], total: 0 }));

      mockGetActivePrompt.mockResolvedValue(Result.ok(mockPrompt));
      mockRenderPrompt.mockReturnValue('Rendered prompt');

      mockComplete.mockResolvedValue(
        Result.ok({
          text: 'Response',
          requestTokens: 10,
          responseTokens: 20,
          totalTokens: 30,
          costUsd: 0.001,
          durationMs: 500,
          model: 'gpt-4',
          provider: 'openai',
        })
      );

      const mockAssistantMessage: ChatbotMessage = {
        id: 'msg-2',
        conversationId: 'conv-1',
        role: 'assistant',
        content: 'Response',
        intent: null,
        metadata: {},
        tokensUsed: 30,
        costUsd: 0.001,
        createdAt: new Date(),
      };
      mockCreateMessage.mockResolvedValueOnce(Result.ok(mockUserMessage));
      mockCreateMessage.mockResolvedValueOnce(Result.ok(mockAssistantMessage));

      mockUpdateConversation.mockResolvedValue(Result.ok(mockConversation));

      const result = await useCase.sendMessage({
        conversationId: 'conv-1',
        message: 'Hello',
        userId: 'user-1',
      });

      expect(result.isSuccess).toBe(true);
      expect(mockFindConversationById).toHaveBeenCalledWith('conv-1');
      expect(mockCreateConversation).not.toHaveBeenCalled();
    });

    it('should return error when conversation not found', async () => {
      mockFindConversationById.mockResolvedValue(Result.ok(null));

      const result = await useCase.sendMessage({
        conversationId: 'invalid-id',
        message: 'Hello',
        userId: 'user-1',
      });

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBeInstanceOf(AppError);
        expect(result.error?.statusCode).toBe(404);
      }
    });

    it('should return error when prompt not found', async () => {
      mockCreateConversation.mockResolvedValue(Result.ok(mockConversation));
      mockCreateMessage.mockResolvedValue(
        Result.ok({
          id: 'msg-1',
          conversationId: 'conv-1',
          role: 'user',
          content: 'Hello',
          intent: 'general',
          metadata: {},
          tokensUsed: 0,
          costUsd: 0,
          createdAt: new Date(),
        } as ChatbotMessage)
      );
      mockFindMessagesByConversationId.mockResolvedValue(Result.ok({ data: [], total: 0 }));
      mockGetActivePrompt.mockResolvedValue(Result.fail('Prompt not found'));

      const result = await useCase.sendMessage({
        message: 'Hello',
        userId: 'user-1',
      });

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBeInstanceOf(AppError);
        expect(result.error?.statusCode).toBe(404);
      }
    });

    it('should return error when AI response fails', async () => {
      mockCreateConversation.mockResolvedValue(Result.ok(mockConversation));
      mockCreateMessage.mockResolvedValue(
        Result.ok({
          id: 'msg-1',
          conversationId: 'conv-1',
          role: 'user',
          content: 'Hello',
          intent: 'general',
          metadata: {},
          tokensUsed: 0,
          costUsd: 0,
          createdAt: new Date(),
        } as ChatbotMessage)
      );
      mockFindMessagesByConversationId.mockResolvedValue(Result.ok({ data: [], total: 0 }));
      mockGetActivePrompt.mockResolvedValue(Result.ok(mockPrompt));
      mockRenderPrompt.mockReturnValue('Rendered prompt');
      mockComplete.mockResolvedValue(Result.fail({ message: 'AI error', retryable: false }));

      const result = await useCase.sendMessage({
        message: 'Hello',
        userId: 'user-1',
      });

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBeInstanceOf(AppError);
      }
    });
  });
});
