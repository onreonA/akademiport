import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateTopicUseCase } from './CreateTopicUseCase';
import { IForumRepository } from '@/3-domain/interfaces/repositories/IForumRepository';
import { TopicStatus, TopicPriority } from '@/3-domain/enums/ForumEnums';
import { Result } from '@/6-core/result/Result';
import type { ForumTopic } from '@/3-domain/entities/Forum';
import { CreateTopicDto } from '@/2-application/dtos/forum';

describe('CreateTopicUseCase', () => {
  let mockRepository: IForumRepository;
  let useCase: CreateTopicUseCase;

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
      createCategory: vi.fn(),
      findCategoryById: vi.fn(),
      findCategoryBySlug: vi.fn(),
      findAllCategories: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
      findTopicBySlug: vi.fn(),
      createNotification: vi.fn(),
    } as any;

    useCase = new CreateTopicUseCase(mockRepository);
  });

  const createValidDto = (): CreateTopicDto => ({
    programId: 'program-1',
    categoryId: 'category-1',
    title: 'Test Forum Konusu',
    content: 'Test içerik',
    priority: TopicPriority.NORMAL,
  });

  const createMockTopic = (): ForumTopic => ({
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
    isApproved: false,
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

  describe('execute', () => {
    it('should create topic successfully', async () => {
      const dto = createValidDto();
      const userId = 'user-1';
      const companyId = 'company-1';
      const mockTopic = createMockTopic();
      const mockCategory = {
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
      };

      vi.mocked(mockRepository.findCategoryById).mockResolvedValue(Result.ok(mockCategory));
      vi.mocked(mockRepository.findTopicBySlug).mockResolvedValue(Result.ok(null));
      vi.mocked(mockRepository.createTopic).mockResolvedValue(Result.ok(mockTopic));

      const result = await useCase.execute(dto, userId, companyId);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual({ id: mockTopic.id });
      expect(mockRepository.findCategoryById).toHaveBeenCalledWith(dto.categoryId);
      expect(mockRepository.createTopic).toHaveBeenCalled();
    });

    it('should fail when category not found', async () => {
      const dto = createValidDto();
      const userId = 'user-1';
      const companyId = 'company-1';

      vi.mocked(mockRepository.findCategoryById).mockResolvedValue(Result.ok(null));

      const result = await useCase.execute(dto, userId, companyId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message || result.error).toBe('Kategori bulunamadı');
    });

    it('should fail when repository fails', async () => {
      const dto = createValidDto();
      const userId = 'user-1';
      const companyId = 'company-1';
      const mockCategory = {
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
      };

      vi.mocked(mockRepository.findCategoryById).mockResolvedValue(Result.ok(mockCategory));
      vi.mocked(mockRepository.findTopicBySlug).mockResolvedValue(Result.ok(null));
      vi.mocked(mockRepository.createTopic).mockResolvedValue(Result.fail('Repository error'));

      const result = await useCase.execute(dto, userId, companyId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message || result.error).toBe('Repository error');
    });

    it('should handle repository exceptions', async () => {
      const dto = createValidDto();
      const userId = 'user-1';
      const companyId = 'company-1';
      const mockCategory = {
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
      };

      vi.mocked(mockRepository.findCategoryById).mockResolvedValue(Result.ok(mockCategory));
      vi.mocked(mockRepository.findTopicBySlug).mockRejectedValue(new Error('Database error'));

      const result = await useCase.execute(dto, userId, companyId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message || result.error).toContain('Database error');
    });
  });
});
