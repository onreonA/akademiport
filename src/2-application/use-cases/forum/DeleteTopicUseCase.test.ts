/**
 * Unit Tests for DeleteTopicUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteTopicUseCase } from './DeleteTopicUseCase';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';
import { TopicStatus, TopicPriority } from '@/3-domain/enums/ForumEnums';
import { Result } from '@/6-core/result/Result';
import type { ForumTopic } from '@/3-domain/entities/Forum';

describe('DeleteTopicUseCase', () => {
  let mockRepository: IForumRepository;
  let useCase: DeleteTopicUseCase;

  beforeEach(() => {
    mockRepository = {
      findAllTopics: vi.fn(),
      findTopicById: vi.fn(),
      findTopicBySlug: vi.fn(),
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
      createCategory: vi.fn(),
      findCategoryById: vi.fn(),
      findCategoryBySlug: vi.fn(),
      findAllCategories: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
      createNotification: vi.fn(),
    } as any;

    useCase = new DeleteTopicUseCase(mockRepository);
  });

  const createMockTopic = (overrides?: Partial<ForumTopic>): ForumTopic => ({
    id: 'topic-1',
    categoryId: 'category-1',
    programId: 'program-1',
    authorId: 'author-1',
    companyId: 'company-1',
    title: 'Test Forum Konusu',
    slug: 'test-forum-konusu',
    content: 'Test içerik',
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
  });

  describe('execute', () => {
    it('should delete topic successfully when user is author', async () => {
      const topicId = 'topic-1';
      const userId = 'author-1';
      const mockTopic = createMockTopic({ id: topicId, authorId: userId });

      vi.mocked(mockRepository.findTopicById).mockResolvedValue(Result.ok(mockTopic));
      vi.mocked(mockRepository.deleteTopic).mockResolvedValue(Result.ok(undefined));

      const result = await useCase.execute(topicId, userId);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findTopicById).toHaveBeenCalledWith(topicId);
      expect(mockRepository.deleteTopic).toHaveBeenCalledWith(topicId);
    });

    it('should return error when topic is not found', async () => {
      const topicId = 'non-existent-topic';
      const userId = 'author-1';

      vi.mocked(mockRepository.findTopicById).mockResolvedValue(Result.fail('Konu bulunamadı'));

      const result = await useCase.execute(topicId, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message || result.error).toBe('Konu bulunamadı');
      expect(mockRepository.deleteTopic).not.toHaveBeenCalled();
    });

    it('should return error when topic does not exist', async () => {
      const topicId = 'non-existent-topic';
      const userId = 'author-1';

      vi.mocked(mockRepository.findTopicById).mockResolvedValue(Result.ok(null));

      const result = await useCase.execute(topicId, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Konu bulunamadı');
      expect(mockRepository.deleteTopic).not.toHaveBeenCalled();
    });

    it('should handle repository delete errors', async () => {
      const topicId = 'topic-1';
      const userId = 'author-1';
      const mockTopic = createMockTopic({ id: topicId, authorId: userId });

      vi.mocked(mockRepository.findTopicById).mockResolvedValue(Result.ok(mockTopic));
      vi.mocked(mockRepository.deleteTopic).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute(topicId, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Database error');
    });

    it('should handle unexpected errors', async () => {
      const topicId = 'topic-1';
      const userId = 'author-1';

      vi.mocked(mockRepository.findTopicById).mockRejectedValue(new Error('Unexpected error'));

      const result = await useCase.execute(topicId, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('hata oluştu');
    });
  });
});
