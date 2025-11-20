/**
 * Unit Tests for ListTopicsUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListTopicsUseCase } from './ListTopicsUseCase';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';
import { TopicFilterDto } from '@/2-application/dtos/forum/TopicFilterDto';
import { Result } from '@/6-core/result/Result';
import { TopicStatus, TopicPriority } from '@/3-domain/enums/ForumEnums';
import type { ForumTopicWithDetails } from '@/3-domain/interfaces/repositories/IForumRepository';

describe('ListTopicsUseCase', () => {
  let mockRepository: IForumRepository;
  let useCase: ListTopicsUseCase;

  beforeEach(() => {
    mockRepository = {
      findAllTopics: vi.fn(),
      findTopicById: vi.fn(),
      createTopic: vi.fn(),
      updateTopic: vi.fn(),
      deleteTopic: vi.fn(),
      pinTopic: vi.fn(),
      unpinTopic: vi.fn(),
      lockTopic: vi.fn(),
      unlockTopic: vi.fn(),
      closeTopic: vi.fn(),
      openTopic: vi.fn(),
      approveTopic: vi.fn(),
      rejectTopic: vi.fn(),
      markSolution: vi.fn(),
      unmarkSolution: vi.fn(),
      incrementViewCount: vi.fn(),
      createReply: vi.fn(),
      findReplyById: vi.fn(),
      findAllReplies: vi.fn(),
      updateReply: vi.fn(),
      deleteReply: vi.fn(),
      approveReply: vi.fn(),
      rejectReply: vi.fn(),
      likeTopic: vi.fn(),
      unlikeTopic: vi.fn(),
      likeReply: vi.fn(),
      unlikeReply: vi.fn(),
      isTopicLikedByUser: vi.fn(),
      createCategory: vi.fn(),
      findCategoryById: vi.fn(),
      findCategoryBySlug: vi.fn(),
      findAllCategories: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
      findTopicBySlug: vi.fn(),
      createNotification: vi.fn(),
    } as any;

    useCase = new ListTopicsUseCase(mockRepository);
  });

  const createMockTopic = (overrides?: Partial<ForumTopicWithDetails>): ForumTopicWithDetails => {
    return {
      id: 'topic-1',
      categoryId: 'category-1',
      programId: 'program-1',
      authorId: 'author-1',
      companyId: 'company-1',
      title: 'Test Topic',
      slug: 'test-topic',
      content: 'Test content',
      status: TopicStatus.OPEN,
      priority: TopicPriority.NORMAL,
      isPinned: false,
      isLocked: false,
      isApproved: true,
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
      category: {
        id: 'category-1',
        programId: 'program-1',
        name: 'Test Category',
        slug: 'test-category',
        description: null,
        icon: null,
        color: null,
        orderIndex: 0,
        isActive: true,
        requireApproval: false,
        topicCount: 0,
        replyCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: null,
      },
      ...overrides,
    };
  };

  const createValidFilters = (overrides?: Partial<TopicFilterDto>): TopicFilterDto => {
    return {
      programId: 'program-1',
      categoryId: 'category-1',
      page: 1,
      limit: 20,
      ...overrides,
    };
  };

  describe('execute', () => {
    it('should list topics successfully', async () => {
      const filters = createValidFilters();
      const mockTopics = [createMockTopic({ id: 'topic-1' }), createMockTopic({ id: 'topic-2' })];

      vi.mocked(mockRepository.findAllTopics).mockResolvedValue(
        Result.ok({ topics: mockTopics, total: 2 })
      );

      const result = await useCase.execute(filters);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.topics).toEqual(mockTopics);
      expect(result.value?.total).toBe(2);
      expect(mockRepository.findAllTopics).toHaveBeenCalledWith(
        expect.objectContaining({
          programId: 'program-1',
          categoryId: 'category-1',
          limit: 20,
          offset: 0,
        })
      );
    });

    it('should filter topics by programId', async () => {
      const filters = createValidFilters({ programId: 'program-2' });
      const mockTopics = [createMockTopic({ id: 'topic-1', programId: 'program-2' })];

      vi.mocked(mockRepository.findAllTopics).mockResolvedValue(
        Result.ok({ topics: mockTopics, total: 1 })
      );

      const result = await useCase.execute(filters);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findAllTopics).toHaveBeenCalledWith(
        expect.objectContaining({
          programId: 'program-2',
        })
      );
    });

    it('should filter topics by categoryId', async () => {
      const filters = createValidFilters({ categoryId: 'category-2' });
      const mockTopics = [createMockTopic({ id: 'topic-1', categoryId: 'category-2' })];

      vi.mocked(mockRepository.findAllTopics).mockResolvedValue(
        Result.ok({ topics: mockTopics, total: 1 })
      );

      const result = await useCase.execute(filters);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findAllTopics).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryId: 'category-2',
        })
      );
    });

    it('should filter topics by status', async () => {
      const filters = createValidFilters({ status: TopicStatus.CLOSED });
      const mockTopics = [createMockTopic({ id: 'topic-1', status: TopicStatus.CLOSED })];

      vi.mocked(mockRepository.findAllTopics).mockResolvedValue(
        Result.ok({ topics: mockTopics, total: 1 })
      );

      const result = await useCase.execute(filters);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findAllTopics).toHaveBeenCalledWith(
        expect.objectContaining({
          status: TopicStatus.CLOSED,
        })
      );
    });

    it('should filter topics by priority', async () => {
      const filters = createValidFilters({ priority: TopicPriority.HIGH });
      const mockTopics = [createMockTopic({ id: 'topic-1', priority: TopicPriority.HIGH })];

      vi.mocked(mockRepository.findAllTopics).mockResolvedValue(
        Result.ok({ topics: mockTopics, total: 1 })
      );

      const result = await useCase.execute(filters);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findAllTopics).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: TopicPriority.HIGH,
        })
      );
    });

    it('should filter pinned topics', async () => {
      const filters = createValidFilters({ isPinned: true });
      const mockTopics = [createMockTopic({ id: 'topic-1', isPinned: true })];

      vi.mocked(mockRepository.findAllTopics).mockResolvedValue(
        Result.ok({ topics: mockTopics, total: 1 })
      );

      const result = await useCase.execute(filters);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findAllTopics).toHaveBeenCalledWith(
        expect.objectContaining({
          isPinned: true,
        })
      );
    });

    it('should filter locked topics', async () => {
      const filters = createValidFilters({ isLocked: true });
      const mockTopics = [createMockTopic({ id: 'topic-1', isLocked: true })];

      vi.mocked(mockRepository.findAllTopics).mockResolvedValue(
        Result.ok({ topics: mockTopics, total: 1 })
      );

      const result = await useCase.execute(filters);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findAllTopics).toHaveBeenCalledWith(
        expect.objectContaining({
          isLocked: true,
        })
      );
    });

    it('should filter approved topics', async () => {
      const filters = createValidFilters({ isApproved: true });
      const mockTopics = [createMockTopic({ id: 'topic-1', isApproved: true })];

      vi.mocked(mockRepository.findAllTopics).mockResolvedValue(
        Result.ok({ topics: mockTopics, total: 1 })
      );

      const result = await useCase.execute(filters);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findAllTopics).toHaveBeenCalledWith(
        expect.objectContaining({
          isApproved: true,
        })
      );
    });

    it('should search topics by text', async () => {
      const filters = createValidFilters({ search: 'test query' });
      const mockTopics = [createMockTopic({ id: 'topic-1', title: 'Test Query Topic' })];

      vi.mocked(mockRepository.findAllTopics).mockResolvedValue(
        Result.ok({ topics: mockTopics, total: 1 })
      );

      const result = await useCase.execute(filters);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findAllTopics).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'test query',
        })
      );
    });

    it('should handle pagination correctly', async () => {
      const filters = createValidFilters({ page: 2, limit: 10 });
      const mockTopics = Array.from({ length: 10 }, (_, i) =>
        createMockTopic({ id: `topic-${i + 1}` })
      );

      vi.mocked(mockRepository.findAllTopics).mockResolvedValue(
        Result.ok({ topics: mockTopics, total: 25 })
      );

      const result = await useCase.execute(filters);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findAllTopics).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 10, // (page - 1) * limit = (2 - 1) * 10 = 10
        })
      );
    });

    it('should return empty list when no topics found', async () => {
      const filters = createValidFilters();

      vi.mocked(mockRepository.findAllTopics).mockResolvedValue(
        Result.ok({ topics: [], total: 0 })
      );

      const result = await useCase.execute(filters);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.topics).toEqual([]);
      expect(result.value?.total).toBe(0);
    });

    it('should handle repository failure', async () => {
      const filters = createValidFilters();

      vi.mocked(mockRepository.findAllTopics).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute(filters);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Database error');
    });

    it('should handle errors gracefully', async () => {
      const filters = createValidFilters();

      vi.mocked(mockRepository.findAllTopics).mockRejectedValue(new Error('Unexpected error'));

      const result = await useCase.execute(filters);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Unexpected error');
    });

    it('should use default limit when not provided', async () => {
      const filters: TopicFilterDto = {
        programId: 'program-1',
      };

      vi.mocked(mockRepository.findAllTopics).mockResolvedValue(
        Result.ok({ topics: [], total: 0 })
      );

      const result = await useCase.execute(filters);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findAllTopics).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 20,
        })
      );
    });
  });
});
