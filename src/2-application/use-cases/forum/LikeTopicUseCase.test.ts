/**
 * Unit Tests for LikeTopicUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LikeTopicUseCase } from './LikeTopicUseCase';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';
import { Result } from '@/6-core/result/Result';
import { TopicStatus, TopicPriority } from '@/3-domain/enums/ForumEnums';
import type { ForumTopic } from '@/3-domain/entities/Forum';

describe('LikeTopicUseCase', () => {
  let mockRepository: IForumRepository;
  let useCase: LikeTopicUseCase;

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

    useCase = new LikeTopicUseCase(mockRepository);
  });

  const createMockTopic = (overrides?: Partial<ForumTopic>): ForumTopic => {
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
      ...overrides,
    };
  };

  describe('execute', () => {
    it('should like topic successfully', async () => {
      const topicId = 'topic-1';
      const userId = 'user-1';
      const mockTopic = createMockTopic({ id: topicId });

      vi.mocked(mockRepository.findTopicById).mockResolvedValue(Result.ok(mockTopic));
      vi.mocked(mockRepository.isTopicLikedByUser).mockResolvedValue(Result.ok(false));
      vi.mocked(mockRepository.likeTopic).mockResolvedValue(Result.ok(undefined));

      const result = await useCase.execute(topicId, userId);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findTopicById).toHaveBeenCalledWith(topicId);
      expect(mockRepository.isTopicLikedByUser).toHaveBeenCalledWith(topicId, userId);
      expect(mockRepository.likeTopic).toHaveBeenCalledWith(topicId, userId);
    });

    it('should return error when topic is not found', async () => {
      const topicId = 'non-existent-topic';
      const userId = 'user-1';

      vi.mocked(mockRepository.findTopicById).mockResolvedValue(Result.fail('Topic not found'));

      const result = await useCase.execute(topicId, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Konu bulunamadı');
      expect(mockRepository.likeTopic).not.toHaveBeenCalled();
    });

    it('should return error when topic is already liked', async () => {
      const topicId = 'topic-1';
      const userId = 'user-1';
      const mockTopic = createMockTopic({ id: topicId });

      vi.mocked(mockRepository.findTopicById).mockResolvedValue(Result.ok(mockTopic));
      vi.mocked(mockRepository.isTopicLikedByUser).mockResolvedValue(Result.ok(true));

      const result = await useCase.execute(topicId, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Bu konuyu zaten beğendiniz');
      expect(mockRepository.likeTopic).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      const topicId = 'topic-1';
      const userId = 'user-1';
      const mockTopic = createMockTopic({ id: topicId });

      vi.mocked(mockRepository.findTopicById).mockResolvedValue(Result.ok(mockTopic));
      vi.mocked(mockRepository.isTopicLikedByUser).mockResolvedValue(Result.ok(false));
      vi.mocked(mockRepository.likeTopic).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute(topicId, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Database error');
    });

    it('should handle errors gracefully', async () => {
      const topicId = 'topic-1';
      const userId = 'user-1';

      vi.mocked(mockRepository.findTopicById).mockRejectedValue(new Error('Unexpected error'));

      const result = await useCase.execute(topicId, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Unexpected error');
    });
  });
});
