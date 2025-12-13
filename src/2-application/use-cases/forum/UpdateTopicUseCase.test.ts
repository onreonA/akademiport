/**
 * Unit Tests for UpdateTopicUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateTopicUseCase } from './UpdateTopicUseCase';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';
import { TopicStatus, TopicPriority } from '@/3-domain/enums/ForumEnums';
import { Result } from '@/6-core/result/Result';
import type { ForumTopic } from '@/3-domain/entities/Forum';
import { UpdateTopicDto } from '@/2-application/dtos/forum';

describe('UpdateTopicUseCase', () => {
  let mockRepository: IForumRepository;
  let useCase: UpdateTopicUseCase;

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

    useCase = new UpdateTopicUseCase(mockRepository);
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
    it('should update topic successfully when user is author', async () => {
      const topicId = 'topic-1';
      const userId = 'author-1';
      const dto: UpdateTopicDto = {
        title: 'Updated Title',
        content: 'Updated content',
      };
      const mockTopic = createMockTopic({ id: topicId, authorId: userId });
      const updatedTopic = createMockTopic({
        id: topicId,
        authorId: userId,
        title: 'Updated Title',
        content: 'Updated content',
        slug: 'updated-title',
      });

      vi.mocked(mockRepository.findTopicById).mockResolvedValue(Result.ok(mockTopic));
      vi.mocked(mockRepository.findTopicBySlug).mockResolvedValue(Result.ok(null));
      vi.mocked(mockRepository.updateTopic).mockResolvedValue(Result.ok(updatedTopic));

      const result = await useCase.execute(topicId, dto, userId);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(updatedTopic);
      expect(mockRepository.findTopicById).toHaveBeenCalledWith(topicId);
      expect(mockRepository.updateTopic).toHaveBeenCalled();
    });

    it('should regenerate slug when title changes', async () => {
      const topicId = 'topic-1';
      const userId = 'author-1';
      const dto: UpdateTopicDto = {
        title: 'New Title',
      };
      const mockTopic = createMockTopic({ id: topicId, authorId: userId, title: 'Old Title' });
      const updatedTopic = createMockTopic({
        id: topicId,
        title: 'New Title',
        slug: 'new-title',
      });

      vi.mocked(mockRepository.findTopicById).mockResolvedValue(Result.ok(mockTopic));
      vi.mocked(mockRepository.findTopicBySlug).mockResolvedValue(Result.ok(null));
      vi.mocked(mockRepository.updateTopic).mockResolvedValue(Result.ok(updatedTopic));

      const result = await useCase.execute(topicId, dto, userId);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findTopicBySlug).toHaveBeenCalledWith('program-1', 'new-title');
      expect(mockRepository.updateTopic).toHaveBeenCalledWith(
        topicId,
        expect.objectContaining({ slug: 'new-title' })
      );
    });

    it('should return error when topic is not found', async () => {
      const topicId = 'non-existent-topic';
      const userId = 'author-1';
      const dto: UpdateTopicDto = {
        title: 'Updated Title',
      };

      vi.mocked(mockRepository.findTopicById).mockResolvedValue(Result.fail('Konu bulunamadı'));

      const result = await useCase.execute(topicId, dto, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message || result.error).toBe('Konu bulunamadı');
      expect(mockRepository.updateTopic).not.toHaveBeenCalled();
    });

    it('should return error when slug already exists', async () => {
      const topicId = 'topic-1';
      const userId = 'author-1';
      const dto: UpdateTopicDto = {
        title: 'Existing Title',
      };
      const mockTopic = createMockTopic({ id: topicId, authorId: userId });
      const existingTopic = createMockTopic({ id: 'other-topic', slug: 'existing-title' });

      vi.mocked(mockRepository.findTopicById).mockResolvedValue(Result.ok(mockTopic));
      vi.mocked(mockRepository.findTopicBySlug).mockResolvedValue(Result.ok(existingTopic));

      const result = await useCase.execute(topicId, dto, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Bu başlıkta bir konu zaten mevcut');
      expect(mockRepository.updateTopic).not.toHaveBeenCalled();
    });

    it('should allow updating same topic with same title', async () => {
      const topicId = 'topic-1';
      const userId = 'author-1';
      const dto: UpdateTopicDto = {
        title: 'Test Forum Konusu', // Same title
        content: 'Updated content',
      };
      const mockTopic = createMockTopic({ id: topicId, authorId: userId });
      const updatedTopic = createMockTopic({
        id: topicId,
        content: 'Updated content',
      });

      vi.mocked(mockRepository.findTopicById).mockResolvedValue(Result.ok(mockTopic));
      vi.mocked(mockRepository.updateTopic).mockResolvedValue(Result.ok(updatedTopic));

      const result = await useCase.execute(topicId, dto, userId);

      expect(result.isSuccess).toBe(true);
      // Should not check slug if title hasn't changed
      expect(mockRepository.findTopicBySlug).not.toHaveBeenCalled();
      expect(mockRepository.updateTopic).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const topicId = 'topic-1';
      const userId = 'author-1';
      const dto: UpdateTopicDto = {
        title: '', // Invalid: empty title
      };
      const mockTopic = createMockTopic({ id: topicId, authorId: userId });

      vi.mocked(mockRepository.findTopicById).mockResolvedValue(Result.ok(mockTopic));

      const result = await useCase.execute(topicId, dto, userId);

      expect(result.isFailure).toBe(true);
      expect(mockRepository.updateTopic).not.toHaveBeenCalled();
    });

    it('should handle repository update errors', async () => {
      const topicId = 'topic-1';
      const userId = 'author-1';
      const dto: UpdateTopicDto = {
        content: 'Updated content',
      };
      const mockTopic = createMockTopic({ id: topicId, authorId: userId });

      vi.mocked(mockRepository.findTopicById).mockResolvedValue(Result.ok(mockTopic));
      vi.mocked(mockRepository.updateTopic).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute(topicId, dto, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Database error');
    });

    it('should handle unexpected errors', async () => {
      const topicId = 'topic-1';
      const userId = 'author-1';
      const dto: UpdateTopicDto = {
        content: 'Updated content',
      };

      vi.mocked(mockRepository.findTopicById).mockRejectedValue(new Error('Unexpected error'));

      const result = await useCase.execute(topicId, dto, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('hata oluştu');
    });
  });
});
