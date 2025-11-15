import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReplyTopicUseCase } from './ReplyTopicUseCase';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';
import { Result } from '@/6-core/result/Result';
import type { ForumReply, ForumTopic } from '@/3-domain/entities/Forum';
import { CreateReplyDto } from '@/2-application/dtos/forum';
import { TopicStatus } from '@/3-domain/enums/ForumEnums';

describe('ReplyTopicUseCase', () => {
  let mockRepository: IForumRepository;
  let useCase: ReplyTopicUseCase;

  beforeEach(() => {
    mockRepository = {
      createTopic: vi.fn(),
      findTopicById: vi.fn(),
      findAllTopics: vi.fn(),
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
      createNotification: vi.fn(),
      createCategory: vi.fn(),
      findCategoryById: vi.fn(),
      findCategoryBySlug: vi.fn(),
      findAllCategories: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
    } as any;

    useCase = new ReplyTopicUseCase(mockRepository);
  });

  const createValidDto = (topicId: string = 'topic-1'): CreateReplyDto => ({
    topicId,
    content: 'Test yanıt içeriği',
  });

  const createMockTopic = (): ForumTopic => ({
    id: 'topic-1',
    categoryId: 'category-1',
    programId: 'program-1',
    authorId: 'author-1',
    companyId: 'company-1',
    title: 'Test Topic',
    slug: 'test-topic',
    content: 'Test content',
    status: 'open' as any,
    priority: 'normal' as any,
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
  });

  const createMockReply = (): ForumReply => ({
    id: 'reply-1',
    topicId: 'topic-1',
    authorId: 'user-1',
    companyId: 'company-1',
    parentId: null,
    content: 'Test yanıt içeriği',
    isApproved: false,
    isEdited: false,
    isSolution: false,
    likeCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  describe('execute', () => {
    it('should create reply successfully', async () => {
      const topicId = 'topic-1';
      const dto = createValidDto(topicId);
      const userId = 'user-1';
      const companyId = 'company-1';
      const mockTopic = createMockTopic();
      const mockReply = createMockReply();

      vi.mocked(mockRepository.findTopicById).mockResolvedValue(Result.ok(mockTopic));
      vi.mocked(mockRepository.createReply).mockResolvedValue(Result.ok(mockReply));
      vi.mocked(mockRepository.createNotification).mockResolvedValue(
        Result.ok({
          id: 'notif-1',
          userId: mockTopic.authorId,
          topicId: topicId,
          replyId: mockReply.id,
          type: 'new_reply',
          title: 'Test',
          message: null,
          isRead: false,
          readAt: null,
          createdAt: new Date(),
        })
      );

      const result = await useCase.execute(dto, userId, companyId);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual({ id: mockReply.id });
      expect(mockRepository.findTopicById).toHaveBeenCalledWith(dto.topicId);
      expect(mockRepository.createReply).toHaveBeenCalled();
    });

    it('should fail when topic not found', async () => {
      const dto = createValidDto();
      const topicId = 'topic-1';
      const userId = 'user-1';
      const companyId = 'company-1';

      vi.mocked(mockRepository.findTopicById).mockResolvedValue(Result.ok(null));

      const result = await useCase.execute(dto, userId, companyId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message || result.error).toBe('Konu bulunamadı');
    });

    it('should fail when topic is locked', async () => {
      const dto = createValidDto();
      const topicId = 'topic-1';
      const userId = 'user-1';
      const companyId = 'company-1';
      const lockedTopic = { ...createMockTopic(), isLocked: true };

      vi.mocked(mockRepository.findTopicById).mockResolvedValue(Result.ok(lockedTopic));

      const result = await useCase.execute(dto, userId, companyId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message || result.error).toBe('Bu konu kilitli, yanıt yazılamaz');
    });

    it('should fail when topic is not approved', async () => {
      const dto = createValidDto();
      const topicId = 'topic-1';
      const userId = 'user-1';
      const companyId = 'company-1';
      const unapprovedTopic = { ...createMockTopic(), isApproved: false };

      vi.mocked(mockRepository.findTopicById).mockResolvedValue(Result.ok(unapprovedTopic));

      const result = await useCase.execute(dto, userId, companyId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message || result.error).toBe('Bu konu henüz onaylanmamış');
    });
  });
});
