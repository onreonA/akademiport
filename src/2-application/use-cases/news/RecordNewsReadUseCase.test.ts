import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RecordNewsReadUseCase } from './RecordNewsReadUseCase';
import { INewsRepository } from '@/3-domain/interfaces/repositories/INewsRepository';
import { NewsCategory, NewsStatus } from '@/3-domain/enums/NewsEnums';
import { Result } from '@/6-core/result/Result';
import type { News } from '@/3-domain/entities/News';
import { RecordReadDto } from '@/2-application/dtos/news';

describe('RecordNewsReadUseCase', () => {
  let mockRepository: INewsRepository;
  let useCase: RecordNewsReadUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      publish: vi.fn(),
      archive: vi.fn(),
      unpublish: vi.fn(),
      feature: vi.fn(),
      unfeature: vi.fn(),
      pin: vi.fn(),
      unpin: vi.fn(),
      getTags: vi.fn(),
      createTag: vi.fn(),
      addTagToNews: vi.fn(),
      removeTagFromNews: vi.fn(),
      getNewsTags: vi.fn(),
      createComment: vi.fn(),
      getComments: vi.fn(),
      updateComment: vi.fn(),
      deleteComment: vi.fn(),
      approveComment: vi.fn(),
      likeNews: vi.fn(),
      unlikeNews: vi.fn(),
      isLikedByUser: vi.fn(),
      recordRead: vi.fn(),
      getUserReads: vi.fn(),
      getNewsReads: vi.fn(),
      getStatistics: vi.fn(),
    } as any;

    useCase = new RecordNewsReadUseCase(mockRepository);
  });

  const createMockNews = (): News => ({
    id: 'news-1',
    programId: 'program-1',
    authorId: 'author-1',
    title: 'Test News',
    slug: 'test-news',
    summary: null,
    content: 'Test content',
    category: NewsCategory.GENERAL,
    status: NewsStatus.PUBLISHED,
    imageUrl: null,
    imageAlt: null,
    metaDescription: null,
    metaKeywords: null,
    isFeatured: false,
    isPinned: false,
    readingTime: 1,
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    publishedAt: new Date(),
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'author-1',
    updatedBy: 'author-1',
  });

  const createMockRead = () => ({
    id: 'read-1',
    newsId: 'news-1',
    userId: 'user-1',
    companyId: 'company-1',
    readDuration: 120,
    completed: false,
    scrollPercentage: 50,
    createdAt: new Date(),
  });

  describe('execute', () => {
    it('should record read successfully', async () => {
      const dto: RecordReadDto = {
        newsId: 'news-1',
        userId: 'user-1',
        companyId: 'company-1',
        readDuration: 120,
        scrollPercentage: 50,
      };
      const mockNews = createMockNews();
      const mockRead = createMockRead();

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockNews));
      vi.mocked(mockRepository.recordRead).mockResolvedValue(Result.ok(mockRead));

      const result = await useCase.execute(dto);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockRead);
      expect(mockRepository.findById).toHaveBeenCalledWith('news-1');
      expect(mockRepository.recordRead).toHaveBeenCalled();
    });

    it('should return error if news not found', async () => {
      const dto: RecordReadDto = {
        newsId: 'non-existent',
        userId: 'user-1',
        companyId: 'company-1',
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null));

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Haber bulunamadı');
      expect(mockRepository.recordRead).not.toHaveBeenCalled();
    });

    it('should set completed to true if scrollPercentage >= 80', async () => {
      const dto: RecordReadDto = {
        newsId: 'news-1',
        userId: 'user-1',
        companyId: 'company-1',
        scrollPercentage: 85,
      };
      const mockNews = createMockNews();
      const mockRead = {
        ...createMockRead(),
        completed: true,
        scrollPercentage: 85,
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockNews));
      vi.mocked(mockRepository.recordRead).mockResolvedValue(Result.ok(mockRead));

      await useCase.execute(dto);

      const recordCall = vi.mocked(mockRepository.recordRead).mock.calls[0][0];
      expect(recordCall.completed).toBe(true);
    });

    it('should set completed to false if scrollPercentage < 80', async () => {
      const dto: RecordReadDto = {
        newsId: 'news-1',
        userId: 'user-1',
        companyId: 'company-1',
        scrollPercentage: 50,
      };
      const mockNews = createMockNews();
      const mockRead = createMockRead();

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockNews));
      vi.mocked(mockRepository.recordRead).mockResolvedValue(Result.ok(mockRead));

      await useCase.execute(dto);

      const recordCall = vi.mocked(mockRepository.recordRead).mock.calls[0][0];
      expect(recordCall.completed).toBe(false);
    });

    it('should handle missing scrollPercentage', async () => {
      const dto: RecordReadDto = {
        newsId: 'news-1',
        userId: 'user-1',
        companyId: 'company-1',
        readDuration: 120,
      };
      const mockNews = createMockNews();
      const mockRead = createMockRead();

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockNews));
      vi.mocked(mockRepository.recordRead).mockResolvedValue(Result.ok(mockRead));

      await useCase.execute(dto);

      const recordCall = vi.mocked(mockRepository.recordRead).mock.calls[0][0];
      expect(recordCall.completed).toBe(false);
      expect(recordCall.scrollPercentage).toBe(0);
    });

    it('should return error if repository recordRead fails', async () => {
      const dto: RecordReadDto = {
        newsId: 'news-1',
        userId: 'user-1',
        companyId: 'company-1',
      };
      const mockNews = createMockNews();

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockNews));
      vi.mocked(mockRepository.recordRead).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Database error');
    });
  });
});
