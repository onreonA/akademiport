/**
 * Unit Tests for MarkSolutionUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MarkSolutionUseCase } from './MarkSolutionUseCase';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';
import { AddLeaderboardScoreUseCase } from '@/2-application/use-cases/leaderboard';
import { Result } from '@/6-core/result/Result';
import { TopicStatus, TopicPriority } from '@/3-domain/enums/ForumEnums';
import { ActivityType } from '@/3-domain/enums/LeaderboardEnums';
import type { ForumTopic } from '@/3-domain/entities/Forum';
import type { ForumReply } from '@/3-domain/entities/Forum';

describe('MarkSolutionUseCase', () => {
  let mockRepository: IForumRepository;
  let mockAddLeaderboardScore: AddLeaderboardScoreUseCase;
  let useCase: MarkSolutionUseCase;

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

    mockAddLeaderboardScore = {
      execute: vi.fn(),
    } as any;

    useCase = new MarkSolutionUseCase(mockRepository, mockAddLeaderboardScore);
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

  const createMockReply = (overrides?: Partial<ForumReply>): ForumReply => {
    return {
      id: 'reply-1',
      topicId: 'topic-1',
      authorId: 'author-2',
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
    it('should mark solution successfully when user is topic author', async () => {
      const topicId = 'topic-1';
      const replyId = 'reply-1';
      const userId = 'author-1';
      const mockTopic = createMockTopic({ id: topicId, authorId: userId });
      const mockReply = createMockReply({ id: replyId, topicId });

      vi.mocked(mockRepository.findTopicById).mockResolvedValue(Result.ok(mockTopic));
      vi.mocked(mockRepository.findReplyById).mockResolvedValue(Result.ok(mockReply));
      vi.mocked(mockRepository.markSolution).mockResolvedValue(Result.ok(undefined));
      vi.mocked(mockRepository.createNotification).mockResolvedValue(Result.ok(undefined));
      vi.mocked(mockAddLeaderboardScore.execute).mockResolvedValue(Result.ok(undefined));

      const result = await useCase.execute(topicId, replyId, userId);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findTopicById).toHaveBeenCalledWith(topicId);
      expect(mockRepository.findReplyById).toHaveBeenCalledWith(replyId);
      expect(mockRepository.markSolution).toHaveBeenCalledWith(topicId, replyId, userId);
    });

    it('should return error when topic is not found', async () => {
      const topicId = 'non-existent-topic';
      const replyId = 'reply-1';
      const userId = 'author-1';

      vi.mocked(mockRepository.findTopicById).mockResolvedValue(Result.fail('Topic not found'));

      const result = await useCase.execute(topicId, replyId, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Konu bulunamadı');
      expect(mockRepository.markSolution).not.toHaveBeenCalled();
    });

    it('should return error when user is not topic author', async () => {
      const topicId = 'topic-1';
      const replyId = 'reply-1';
      const userId = 'other-user';
      const mockTopic = createMockTopic({ id: topicId, authorId: 'author-1' });

      vi.mocked(mockRepository.findTopicById).mockResolvedValue(Result.ok(mockTopic));

      const result = await useCase.execute(topicId, replyId, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Sadece konu sahibi');
      expect(mockRepository.markSolution).not.toHaveBeenCalled();
    });

    it('should return error when reply is not found', async () => {
      const topicId = 'topic-1';
      const replyId = 'non-existent-reply';
      const userId = 'author-1';
      const mockTopic = createMockTopic({ id: topicId, authorId: userId });

      vi.mocked(mockRepository.findTopicById).mockResolvedValue(Result.ok(mockTopic));
      vi.mocked(mockRepository.findReplyById).mockResolvedValue(Result.fail('Reply not found'));

      const result = await useCase.execute(topicId, replyId, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Yanıt bulunamadı');
      expect(mockRepository.markSolution).not.toHaveBeenCalled();
    });

    it('should return error when reply belongs to different topic', async () => {
      const topicId = 'topic-1';
      const replyId = 'reply-1';
      const userId = 'author-1';
      const mockTopic = createMockTopic({ id: topicId, authorId: userId });
      const mockReply = createMockReply({ id: replyId, topicId: 'topic-2' });

      vi.mocked(mockRepository.findTopicById).mockResolvedValue(Result.ok(mockTopic));
      vi.mocked(mockRepository.findReplyById).mockResolvedValue(Result.ok(mockReply));

      const result = await useCase.execute(topicId, replyId, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Yanıt bu konuya ait değil');
      expect(mockRepository.markSolution).not.toHaveBeenCalled();
    });

    it('should create notification for reply author when different from marker', async () => {
      const topicId = 'topic-1';
      const replyId = 'reply-1';
      const userId = 'author-1';
      const mockTopic = createMockTopic({ id: topicId, authorId: userId });
      const mockReply = createMockReply({
        id: replyId,
        topicId,
        authorId: 'author-2',
      });

      vi.mocked(mockRepository.findTopicById).mockResolvedValue(Result.ok(mockTopic));
      vi.mocked(mockRepository.findReplyById).mockResolvedValue(Result.ok(mockReply));
      vi.mocked(mockRepository.markSolution).mockResolvedValue(Result.ok(undefined));
      vi.mocked(mockRepository.createNotification).mockResolvedValue(Result.ok(undefined));
      vi.mocked(mockAddLeaderboardScore.execute).mockResolvedValue(Result.ok(undefined));

      const result = await useCase.execute(topicId, replyId, userId);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'author-2',
          topicId,
          replyId,
          type: 'solution_marked',
        })
      );
    });

    it('should add leaderboard score when companyId exists', async () => {
      const topicId = 'topic-1';
      const replyId = 'reply-1';
      const userId = 'author-1';
      const mockTopic = createMockTopic({ id: topicId, authorId: userId });
      const mockReply = createMockReply({
        id: replyId,
        topicId,
        companyId: 'company-1',
      });

      vi.mocked(mockRepository.findTopicById).mockResolvedValue(Result.ok(mockTopic));
      vi.mocked(mockRepository.findReplyById).mockResolvedValue(Result.ok(mockReply));
      vi.mocked(mockRepository.markSolution).mockResolvedValue(Result.ok(undefined));
      vi.mocked(mockRepository.createNotification).mockResolvedValue(Result.ok(undefined));
      vi.mocked(mockAddLeaderboardScore.execute).mockResolvedValue(Result.ok(undefined));

      const result = await useCase.execute(topicId, replyId, userId);

      expect(result.isSuccess).toBe(true);
      expect(mockAddLeaderboardScore.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: 'company-1',
          activityType: ActivityType.FORUM_SOLUTION_MARKED,
          activityId: replyId,
        })
      );
    });

    it('should handle errors gracefully', async () => {
      const topicId = 'topic-1';
      const replyId = 'reply-1';
      const userId = 'author-1';

      vi.mocked(mockRepository.findTopicById).mockRejectedValue(new Error('Unexpected error'));

      const result = await useCase.execute(topicId, replyId, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Unexpected error');
    });
  });
});
