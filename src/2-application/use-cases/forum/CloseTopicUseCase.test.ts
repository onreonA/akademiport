/**
 * Unit Tests for CloseTopicUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CloseTopicUseCase } from './CloseTopicUseCase';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';
import { Result } from '@/6-core/result/Result';

describe('CloseTopicUseCase', () => {
  let mockRepository: IForumRepository;
  let useCase: CloseTopicUseCase;

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

    useCase = new CloseTopicUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should close topic successfully', async () => {
      const topicId = 'topic-1';

      vi.mocked(mockRepository.closeTopic).mockResolvedValue(Result.ok(undefined));

      const result = await useCase.execute(topicId);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.closeTopic).toHaveBeenCalledWith(topicId);
    });

    it('should handle repository failure', async () => {
      const topicId = 'topic-1';

      vi.mocked(mockRepository.closeTopic).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute(topicId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Database error');
    });

    it('should handle errors gracefully', async () => {
      const topicId = 'topic-1';

      vi.mocked(mockRepository.closeTopic).mockRejectedValue(new Error('Unexpected error'));

      const result = await useCase.execute(topicId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Unexpected error');
    });
  });
});
