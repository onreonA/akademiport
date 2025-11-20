/**
 * RewriteNewsWithAIUseCase Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RewriteNewsWithAIUseCase } from './RewriteNewsWithAIUseCase';
import { IRSSFeedRepository } from '@/3-domain/interfaces/repositories/IRSSFeedRepository';
import { INewsRepository } from '@/3-domain/interfaces/repositories/INewsRepository';
import { IAIRouter } from '@/3-domain/interfaces/services/IAIRouter';
import { IPromptManager } from '@/3-domain/interfaces/services/IPromptManager';
import { ITokenTracker } from '@/3-domain/interfaces/services/ITokenTracker';
import { Result } from '@/6-core/result/Result';
import { RSSFeedItem } from '@/3-domain/entities/RSSFeed';
import { NewsCategory } from '@/3-domain/enums/NewsEnums';
import { AIPrompt, AIResponse } from '@/3-domain/entities/AI';
import { AIProvider, AIUseCase, AIModel } from '@/3-domain/enums/AIEnums';

describe('RewriteNewsWithAIUseCase', () => {
  let useCase: RewriteNewsWithAIUseCase;
  let mockRSSFeedRepository: IRSSFeedRepository;
  let mockNewsRepository: INewsRepository;
  let mockAIRouter: IAIRouter;
  let mockPromptManager: IPromptManager;
  let mockTokenTracker: ITokenTracker;

  beforeEach(() => {
    // Mock RSS Feed Repository
    mockRSSFeedRepository = {
      findFeedItemById: vi.fn(),
    } as any;

    // Mock News Repository
    mockNewsRepository = {} as any;

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

    useCase = new RewriteNewsWithAIUseCase(
      mockRSSFeedRepository,
      mockAIRouter,
      mockPromptManager,
      mockTokenTracker
    );
  });

  describe('execute', () => {
    it('should rewrite news successfully', async () => {
      const mockFeedItem: RSSFeedItem = {
        id: 'item-1',
        feedId: 'feed-1',
        title: 'Original Title',
        link: 'https://example.com/news',
        description: 'Original description',
        content: 'Original content',
        author: 'Author',
        pubDate: new Date(),
        guid: 'guid-1',
        imageUrl: null,
        categories: ['GENEL'],
        isProcessed: false,
        processedAt: null,
        newsId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPrompt: AIPrompt = {
        id: 'prompt-1',
        name: 'News Rewrite',
        description: null,
        useCase: AIUseCase.NEWS_REWRITE,
        template: '{{original_title}}',
        variables: {},
        version: 1,
        isActive: true,
        provider: AIProvider.OPENAI,
        model: AIModel.GPT_4_TURBO,
        temperature: 0.7,
        maxTokens: 4000,
        topP: 1.0,
        metadata: null,
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockAIResponse: AIResponse = {
        text: JSON.stringify({
          title: 'Rewritten Title',
          summary: 'Rewritten summary',
          content: 'Rewritten content',
          category: NewsCategory.GENERAL,
          tags: ['tag1', 'tag2'],
          imageUrl: null,
          imageAlt: 'Image alt',
          metaDescription: 'Meta description',
          metaKeywords: ['keyword1', 'keyword2'],
        }),
        provider: AIProvider.OPENAI,
        model: AIModel.GPT_4_TURBO,
        requestTokens: 200,
        responseTokens: 300,
        totalTokens: 500,
        costUsd: 0.01,
        durationMs: 1000,
      };

      vi.mocked(mockRSSFeedRepository.findFeedItemById).mockResolvedValue(Result.ok(mockFeedItem));
      vi.mocked(mockPromptManager.getActivePrompt).mockResolvedValue(Result.ok(mockPrompt));
      vi.mocked(mockPromptManager.renderPrompt).mockReturnValue('Rendered prompt');
      vi.mocked(mockAIRouter.complete).mockResolvedValue(Result.ok(mockAIResponse));

      const result = await useCase.execute({
        feedItemId: 'item-1',
        targetCategory: NewsCategory.GENERAL,
      });

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.title).toBe('Rewritten Title');
        expect(result.value.content).toBe('Rewritten content');
        expect(result.value.category).toBe(NewsCategory.GENERAL);
      }
    });

    it('should handle missing feed item', async () => {
      vi.mocked(mockRSSFeedRepository.findFeedItemById).mockResolvedValue(Result.ok(null));

      const result = await useCase.execute({
        feedItemId: 'non-existent',
      });

      expect(result.isFailure).toBe(true);
    });

    it('should handle missing prompt template', async () => {
      const mockFeedItem: RSSFeedItem = {
        id: 'item-1',
        feedId: 'feed-1',
        title: 'Title',
        link: 'https://example.com',
        description: null,
        content: 'Content',
        author: 'Author',
        pubDate: new Date(),
        guid: 'guid-1',
        imageUrl: null,
        categories: [],
        isProcessed: false,
        processedAt: null,
        newsId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockRSSFeedRepository.findFeedItemById).mockResolvedValue(Result.ok(mockFeedItem));
      vi.mocked(mockPromptManager.getActivePrompt).mockResolvedValue(
        Result.fail(new Error('Prompt not found'))
      );

      const result = await useCase.execute({
        feedItemId: 'item-1',
      });

      expect(result.isFailure).toBe(true);
    });

    it('should handle AI router failure', async () => {
      const mockFeedItem: RSSFeedItem = {
        id: 'item-1',
        feedId: 'feed-1',
        title: 'Title',
        link: 'https://example.com',
        description: null,
        content: 'Content',
        author: 'Author',
        pubDate: new Date(),
        guid: 'guid-1',
        imageUrl: null,
        categories: [],
        isProcessed: false,
        processedAt: null,
        newsId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPrompt: AIPrompt = {
        id: 'prompt-1',
        name: 'News Rewrite',
        description: null,
        useCase: AIUseCase.NEWS_REWRITE,
        template: '{{original_title}}',
        variables: {},
        version: 1,
        isActive: true,
        provider: AIProvider.OPENAI,
        model: AIModel.GPT_4_TURBO,
        temperature: 0.7,
        maxTokens: 4000,
        topP: 1.0,
        metadata: null,
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockRSSFeedRepository.findFeedItemById).mockResolvedValue(Result.ok(mockFeedItem));
      vi.mocked(mockPromptManager.getActivePrompt).mockResolvedValue(Result.ok(mockPrompt));
      vi.mocked(mockPromptManager.renderPrompt).mockReturnValue('Rendered prompt');
      vi.mocked(mockAIRouter.complete).mockResolvedValue(Result.fail(new Error('AI router error')));

      const result = await useCase.execute({
        feedItemId: 'item-1',
      });

      expect(result.isFailure).toBe(true);
    });
  });
});
