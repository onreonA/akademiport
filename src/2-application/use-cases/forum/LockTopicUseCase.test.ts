/**
 * Unit Tests for LockTopicUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LockTopicUseCase } from './LockTopicUseCase';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';
import { Result } from '@/6-core/result/Result';

describe('LockTopicUseCase', () => {
  let mockRepository: IForumRepository;
  let useCase: LockTopicUseCase;

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

    useCase = new LockTopicUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should lock topic successfully', async () => {
      const topicId = 'topic-1';

      const mockTopic = {
        id: topicId,
        programId: 'program-1',
        categoryId: 'category-1',
        authorId: 'user-1',
        companyId: 'company-1',
        title: 'Test Topic',
        slug: 'test-topic',
        content: 'Test content',
        status: 'open' as const,
        priority: 'normal' as const,
        isPinned: false,
        isLocked: true,
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
      };
      vi.mocked(mockRepository.lockTopic).mockResolvedValue(Result.ok(mockTopic));

      const result = await useCase.execute(topicId);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.lockTopic).toHaveBeenCalledWith(topicId);
    });

    it('should handle repository failure', async () => {
      const topicId = 'topic-1';

      vi.mocked(mockRepository.lockTopic).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute(topicId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Database error');
    });

    it('should handle errors gracefully', async () => {
      const topicId = 'topic-1';

      vi.mocked(mockRepository.lockTopic).mockRejectedValue(new Error('Unexpected error'));

      const result = await useCase.execute(topicId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Unexpected error');
    });
  });
});
