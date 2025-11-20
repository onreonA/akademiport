/**
 * DetectSpamUseCase Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DetectSpamUseCase } from './DetectSpamUseCase';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';
import { IAIRouter } from '@/3-domain/interfaces/services/IAIRouter';
import { IPromptManager } from '@/3-domain/interfaces/services/IPromptManager';
import { ITokenTracker } from '@/3-domain/interfaces/services/ITokenTracker';
import { Result } from '@/6-core/result/Result';
import { AIUseCase, AIProvider, AIModel } from '@/3-domain/enums/AIEnums';
import { ForumTopic, ForumReply } from '@/3-domain/entities/Forum';
import { AIPrompt, AIResponse } from '@/3-domain/entities/AI';

describe('DetectSpamUseCase', () => {
  let useCase: DetectSpamUseCase;
  let mockForumRepository: IForumRepository;
  let mockAIRouter: IAIRouter;
  let mockPromptManager: IPromptManager;
  let mockTokenTracker: ITokenTracker;

  beforeEach(() => {
    // Mock Forum Repository
    mockForumRepository = {
      findTopicById: vi.fn(),
      findReplyById: vi.fn(),
    } as any;

    // Mock AI Router
    mockAIRouter = {
      complete: vi.fn(),
    } as any;

    // Mock Prompt Manager
    mockPromptManager = {
      getActivePrompt: vi.fn(),
      renderPrompt: vi.fn(),
    } as any;

    // Mock Token Tracker
    mockTokenTracker = {
      logUsage: vi.fn(),
    } as any;

    useCase = new DetectSpamUseCase(
      mockForumRepository,
      mockAIRouter,
      mockPromptManager,
      mockTokenTracker
    );
  });

  describe('execute', () => {
    it('should detect spam for topic content', async () => {
      const mockTopic: ForumTopic = {
        id: 'topic-1',
        categoryId: 'cat-1',
        programId: 'prog-1',
        authorId: 'user-1',
        companyId: null,
        title: 'Test Topic',
        slug: 'test-topic',
        content: 'This is spam content with many links',
        status: 'open' as any,
        priority: 'normal' as any,
        isPinned: false,
        isLocked: false,
        isApproved: false,
        solutionReplyId: null,
        solvedAt: null,
        solvedBy: null,
        viewCount: 0,
        replyCount: 0,
        likeCount: 0,
        lastReplyAt: null,
        lastReplyBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPrompt: AIPrompt = {
        id: 'prompt-1',
        name: 'Forum Moderation',
        description: null,
        useCase: AIUseCase.FORUM_MODERATION,
        template: '{{content}}',
        variables: {},
        version: 1,
        isActive: true,
        provider: AIProvider.OPENAI,
        model: AIModel.GPT_3_5_TURBO,
        temperature: 0.5,
        maxTokens: 1500,
        topP: 1.0,
        metadata: null,
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockAIResponse: AIResponse = {
        text: JSON.stringify({
          spamScore: 75,
          isSpam: true,
          reason: 'Too many links',
          recommendation: 'reject',
          factors: [{ name: 'Link Spam', score: 75, description: 'Too many links' }],
        }),
        provider: AIProvider.OPENAI,
        model: AIModel.GPT_3_5_TURBO,
        requestTokens: 100,
        responseTokens: 50,
        totalTokens: 150,
        costUsd: 0.001,
        durationMs: 500,
      };

      vi.mocked(mockForumRepository.findTopicById).mockResolvedValue(Result.ok(mockTopic));
      vi.mocked(mockPromptManager.getActivePrompt).mockResolvedValue(Result.ok(mockPrompt));
      vi.mocked(mockPromptManager.renderPrompt).mockReturnValue('Rendered prompt');
      vi.mocked(mockAIRouter.complete).mockResolvedValue(Result.ok(mockAIResponse));

      const result = await useCase.execute({
        topicId: 'topic-1',
        content: 'This is spam content',
      });

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.spamScore).toBe(75);
        expect(result.value.isSpam).toBe(true);
        expect(result.value.recommendation).toBe('reject');
      }
    });

    it('should detect spam for reply content', async () => {
      const mockReply: ForumReply = {
        id: 'reply-1',
        topicId: 'topic-1',
        authorId: 'user-1',
        companyId: null,
        parentId: null,
        content: 'This is spam reply',
        isApproved: false,
        isEdited: false,
        isSolution: false,
        likeCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPrompt: AIPrompt = {
        id: 'prompt-1',
        name: 'Forum Moderation',
        description: null,
        useCase: AIUseCase.FORUM_MODERATION,
        template: '{{content}}',
        variables: {},
        version: 1,
        isActive: true,
        provider: AIProvider.OPENAI,
        model: AIModel.GPT_3_5_TURBO,
        temperature: 0.5,
        maxTokens: 1500,
        topP: 1.0,
        metadata: null,
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockAIResponse: AIResponse = {
        text: JSON.stringify({
          spamScore: 30,
          isSpam: false,
          recommendation: 'approve',
          factors: [],
        }),
        provider: AIProvider.OPENAI,
        model: AIModel.GPT_3_5_TURBO,
        requestTokens: 100,
        responseTokens: 50,
        totalTokens: 150,
        costUsd: 0.001,
        durationMs: 500,
      };

      vi.mocked(mockForumRepository.findReplyById).mockResolvedValue(Result.ok(mockReply));
      vi.mocked(mockPromptManager.getActivePrompt).mockResolvedValue(Result.ok(mockPrompt));
      vi.mocked(mockPromptManager.renderPrompt).mockReturnValue('Rendered prompt');
      vi.mocked(mockAIRouter.complete).mockResolvedValue(Result.ok(mockAIResponse));

      const result = await useCase.execute({
        replyId: 'reply-1',
        content: 'This is normal reply',
      });

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.spamScore).toBe(30);
        expect(result.value.isSpam).toBe(false);
        expect(result.value.recommendation).toBe('approve');
      }
    });

    it('should handle missing content', async () => {
      const result = await useCase.execute({
        content: '',
      });

      expect(result.isFailure).toBe(true);
    });

    it('should handle missing prompt template', async () => {
      vi.mocked(mockPromptManager.getActivePrompt).mockResolvedValue(
        Result.fail(new Error('Prompt not found'))
      );

      const result = await useCase.execute({
        content: 'Test content',
      });

      expect(result.isFailure).toBe(true);
    });

    it('should handle AI router failure', async () => {
      const mockPrompt: AIPrompt = {
        id: 'prompt-1',
        name: 'Forum Moderation',
        description: null,
        useCase: AIUseCase.FORUM_MODERATION,
        template: '{{content}}',
        variables: {},
        version: 1,
        isActive: true,
        provider: AIProvider.OPENAI,
        model: AIModel.GPT_3_5_TURBO,
        temperature: 0.5,
        maxTokens: 1500,
        topP: 1.0,
        metadata: null,
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockPromptManager.getActivePrompt).mockResolvedValue(Result.ok(mockPrompt));
      vi.mocked(mockPromptManager.renderPrompt).mockReturnValue('Rendered prompt');
      vi.mocked(mockAIRouter.complete).mockResolvedValue(Result.fail(new Error('AI router error')));

      const result = await useCase.execute({
        content: 'Test content',
      });

      expect(result.isFailure).toBe(true);
    });
  });
});
