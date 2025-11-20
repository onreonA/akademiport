/**
 * Unit Tests for DeleteReplyUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteReplyUseCase } from './DeleteReplyUseCase';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';
import { Result } from '@/6-core/result/Result';
import type { ForumReply } from '@/3-domain/entities/Forum';

describe('DeleteReplyUseCase', () => {
  let mockRepository: IForumRepository;
  let useCase: DeleteReplyUseCase;

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

    useCase = new DeleteReplyUseCase(mockRepository);
  });

  const createMockReply = (overrides?: Partial<ForumReply>): ForumReply => {
    return {
      id: 'reply-1',
      topicId: 'topic-1',
      authorId: 'author-1',
      companyId: 'company-1',
      parentId: null,
      content: 'Test reply',
      isApproved: true,
      isSolution: false,
      isEdited: false,
      likeCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  describe('execute', () => {
    it('should delete reply successfully when user is author', async () => {
      const replyId = 'reply-1';
      const userId = 'author-1';
      const mockReply = createMockReply({ id: replyId, authorId: userId });

      vi.mocked(mockRepository.findReplyById).mockResolvedValue(Result.ok(mockReply));
      vi.mocked(mockRepository.deleteReply).mockResolvedValue(Result.ok(undefined));

      const result = await useCase.execute(replyId, userId);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findReplyById).toHaveBeenCalledWith(replyId);
      expect(mockRepository.deleteReply).toHaveBeenCalledWith(replyId);
    });

    it('should delete reply successfully when user is admin', async () => {
      const replyId = 'reply-1';
      const userId = 'admin-1';
      const mockReply = createMockReply({ id: replyId, authorId: 'author-1' });

      vi.mocked(mockRepository.findReplyById).mockResolvedValue(Result.ok(mockReply));
      vi.mocked(mockRepository.deleteReply).mockResolvedValue(Result.ok(undefined));

      const result = await useCase.execute(replyId, userId, true);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.deleteReply).toHaveBeenCalledWith(replyId);
    });

    it('should return error when reply is not found', async () => {
      const replyId = 'non-existent-reply';
      const userId = 'author-1';

      vi.mocked(mockRepository.findReplyById).mockResolvedValue(Result.fail('Reply not found'));

      const result = await useCase.execute(replyId, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Yanıt bulunamadı');
      expect(mockRepository.deleteReply).not.toHaveBeenCalled();
    });

    it('should return error when user is not author and not admin', async () => {
      const replyId = 'reply-1';
      const userId = 'other-user';
      const mockReply = createMockReply({ id: replyId, authorId: 'author-1' });

      vi.mocked(mockRepository.findReplyById).mockResolvedValue(Result.ok(mockReply));

      const result = await useCase.execute(replyId, userId, false);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Bu yanıtı silme yetkiniz yok');
      expect(mockRepository.deleteReply).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      const replyId = 'reply-1';
      const userId = 'author-1';
      const mockReply = createMockReply({ id: replyId, authorId: userId });

      vi.mocked(mockRepository.findReplyById).mockResolvedValue(Result.ok(mockReply));
      vi.mocked(mockRepository.deleteReply).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute(replyId, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Database error');
    });

    it('should handle errors gracefully', async () => {
      const replyId = 'reply-1';
      const userId = 'author-1';

      vi.mocked(mockRepository.findReplyById).mockRejectedValue(new Error('Unexpected error'));

      const result = await useCase.execute(replyId, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Unexpected error');
    });
  });
});
