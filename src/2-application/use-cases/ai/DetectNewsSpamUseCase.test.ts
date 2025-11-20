/**
 * DetectNewsSpamUseCase Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DetectNewsSpamUseCase } from './DetectNewsSpamUseCase';
import { INewsRepository } from '@/3-domain/interfaces/repositories/INewsRepository';
import { IAIRouter } from '@/3-domain/interfaces/services/IAIRouter';
import { IPromptManager } from '@/3-domain/interfaces/services/IPromptManager';
import { ITokenTracker } from '@/3-domain/interfaces/services/ITokenTracker';
import { Result } from '@/6-core/result/Result';
import { News } from '@/3-domain/entities/News';
import { NewsStatus, NewsCategory } from '@/3-domain/enums/NewsEnums';
import { AIPrompt, AIResponse } from '@/3-domain/entities/AI';
import { AIProvider, AIUseCase, AIModel } from '@/3-domain/enums/AIEnums';

describe('DetectNewsSpamUseCase', () => {
  let useCase: DetectNewsSpamUseCase;
  let mockNewsRepository: INewsRepository;
  let mockAIRouter: IAIRouter;
  let mockPromptManager: IPromptManager;
  let mockTokenTracker: ITokenTracker;

  beforeEach(() => {
    // Mock News Repository
    mockNewsRepository = {
      findById: vi.fn(),
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

    useCase = new DetectNewsSpamUseCase(
      mockNewsRepository,
      mockAIRouter,
      mockPromptManager,
      mockTokenTracker
    );
  });

  describe('execute', () => {
    it('should detect spam for news content', async () => {
      const mockNews: News = {
        id: 'news-1',
        programId: 'prog-1',
        authorId: 'user-1',
        title: 'Clickbait Title!!!',
        slug: 'clickbait-title',
        summary: 'Summary',
        content: 'This is spam content',
        category: NewsCategory.GENERAL,
        status: NewsStatus.DRAFT,
        imageUrl: null,
        imageAlt: null,
        metaDescription: null,
        metaKeywords: null,
        isFeatured: false,
        isPinned: false,
        readingTime: null,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        publishedAt: null,
        archivedAt: null,
        createdBy: 'user-1',
        updatedBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPrompt: AIPrompt = {
        id: 'prompt-1',
        name: 'News Spam Detection',
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
          spamScore: 80,
          isSpam: true,
          reason: 'Clickbait title',
          recommendation: 'reject',
          factors: [{ name: 'Clickbait', score: 80, description: 'Clickbait title' }],
        }),
        provider: AIProvider.OPENAI,
        model: AIModel.GPT_3_5_TURBO,
        requestTokens: 100,
        responseTokens: 50,
        totalTokens: 150,
        costUsd: 0.001,
        durationMs: 500,
      };

      vi.mocked(mockNewsRepository.findById).mockResolvedValue(Result.ok(mockNews));
      vi.mocked(mockPromptManager.getActivePrompt).mockResolvedValue(Result.ok(mockPrompt));
      vi.mocked(mockPromptManager.renderPrompt).mockReturnValue('Rendered prompt');
      vi.mocked(mockAIRouter.complete).mockResolvedValue(Result.ok(mockAIResponse));

      const result = await useCase.execute({
        newsId: 'news-1',
      });

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.spamScore).toBe(80);
        expect(result.value.isSpam).toBe(true);
        expect(result.value.recommendation).toBe('reject');
      }
    });

    it('should detect spam for direct content', async () => {
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
          spamScore: 25,
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

      vi.mocked(mockPromptManager.getActivePrompt).mockResolvedValue(Result.ok(mockPrompt));
      vi.mocked(mockPromptManager.renderPrompt).mockReturnValue('Rendered prompt');
      vi.mocked(mockAIRouter.complete).mockResolvedValue(Result.ok(mockAIResponse));

      const result = await useCase.execute({
        title: 'Normal Title',
        content: 'Normal content',
      });

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.spamScore).toBe(25);
        expect(result.value.isSpam).toBe(false);
        expect(result.value.recommendation).toBe('approve');
      }
    });

    it('should handle missing content', async () => {
      const result = await useCase.execute({
        title: '',
        content: '',
      });

      expect(result.isFailure).toBe(true);
    });

    it('should handle missing news', async () => {
      vi.mocked(mockNewsRepository.findById).mockResolvedValue(Result.ok(null));

      const result = await useCase.execute({
        newsId: 'non-existent',
      });

      expect(result.isFailure).toBe(true);
    });
  });
});
