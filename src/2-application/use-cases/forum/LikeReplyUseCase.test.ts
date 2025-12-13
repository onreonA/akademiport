/**
 * Unit Tests for LikeReplyUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LikeReplyUseCase } from './LikeReplyUseCase';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';
import { Result } from '@/6-core/result/Result';

describe('LikeReplyUseCase', () => {
  let mockRepository: IForumRepository;
  let useCase: LikeReplyUseCase;

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
      isReplyLikedByUser: vi.fn(),
      createCategory: vi.fn(),
      findCategoryById: vi.fn(),
      findCategoryBySlug: vi.fn(),
      findAllCategories: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
      findTopicBySlug: vi.fn(),
      createNotification: vi.fn(),
    } as any;

    useCase = new LikeReplyUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should like reply successfully', async () => {
      const replyId = 'reply-1';
      const userId = 'user-1';

      const mockReply = {
        id: replyId,
        topicId: 'topic-1',
        authorId: 'author-1',
        companyId: 'company-1',
        content: 'Test reply',
        createdAt: new Date(),
      };

      // Mock findReplyById to return the reply
      vi.mocked(mockRepository.findReplyById).mockResolvedValue(Result.ok(mockReply as any));
      // Mock isReplyLikedByUser to return false (not liked yet)
      vi.mocked(mockRepository.isReplyLikedByUser).mockResolvedValue(Result.ok(false));
      // Mock likeReply to return success
      vi.mocked(mockRepository.likeReply).mockResolvedValue(Result.ok(undefined));

      const result = await useCase.execute(replyId, userId);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findReplyById).toHaveBeenCalledWith(replyId);
      expect(mockRepository.isReplyLikedByUser).toHaveBeenCalledWith(replyId, userId);
      expect(mockRepository.likeReply).toHaveBeenCalledWith(replyId, userId);
    });

    it('should handle repository failure', async () => {
      const replyId = 'reply-1';
      const userId = 'user-1';

      const mockReply = {
        id: replyId,
        topicId: 'topic-1',
        authorId: 'author-1',
        companyId: 'company-1',
        content: 'Test reply',
        createdAt: new Date(),
      };

      // Mock findReplyById to return the reply
      vi.mocked(mockRepository.findReplyById).mockResolvedValue(Result.ok(mockReply as any));
      // Mock isReplyLikedByUser to return false (not liked yet)
      vi.mocked(mockRepository.isReplyLikedByUser).mockResolvedValue(Result.ok(false));
      // Mock likeReply to return failure
      vi.mocked(mockRepository.likeReply).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute(replyId, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('error');
    });

    it('should handle errors gracefully', async () => {
      const replyId = 'reply-1';
      const userId = 'user-1';

      // Mock findReplyById to throw an error
      vi.mocked(mockRepository.findReplyById).mockRejectedValue(new Error('Unexpected error'));

      const result = await useCase.execute(replyId, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Unexpected error');
    });
  });
});
