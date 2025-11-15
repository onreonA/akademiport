import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PublishNewsUseCase } from './PublishNewsUseCase';
import { INewsRepository } from '@/3-domain/interfaces/repositories/INewsRepository';
import { NewsCategory, NewsStatus } from '@/3-domain/enums/NewsEnums';
import { Result } from '@/6-core/result/Result';
import type { News } from '@/3-domain/entities/News';

describe('PublishNewsUseCase', () => {
  let mockRepository: INewsRepository;
  let useCase: PublishNewsUseCase;

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

    useCase = new PublishNewsUseCase(mockRepository);
  });

  const createMockNews = (status: NewsStatus = NewsStatus.DRAFT): News => ({
    id: 'news-1',
    programId: 'program-1',
    authorId: 'author-1',
    title: 'Test News',
    slug: 'test-news',
    summary: null,
    content: 'Test content',
    category: NewsCategory.GENERAL,
    status,
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
    publishedAt: status === NewsStatus.PUBLISHED ? new Date() : null,
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'author-1',
    updatedBy: 'author-1',
  });

  describe('execute', () => {
    it('should publish draft news successfully', async () => {
      const newsId = 'news-1';
      const draftNews = createMockNews(NewsStatus.DRAFT);
      const publishedNews = {
        ...draftNews,
        status: NewsStatus.PUBLISHED,
        publishedAt: new Date(),
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(draftNews));
      vi.mocked(mockRepository.publish).mockResolvedValue(Result.ok(publishedNews));

      const result = await useCase.execute(newsId, 'user-1');

      expect(result.isSuccess).toBe(true);
      expect(result.value.status).toBe(NewsStatus.PUBLISHED);
      expect(mockRepository.findById).toHaveBeenCalledWith(newsId);
      expect(mockRepository.publish).toHaveBeenCalledWith(newsId, 'user-1');
    });

    it('should return error if news not found', async () => {
      const newsId = 'non-existent';

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null));

      const result = await useCase.execute(newsId, 'user-1');

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Haber bulunamadı');
      expect(mockRepository.publish).not.toHaveBeenCalled();
    });

    it('should return error if news already published', async () => {
      const newsId = 'news-1';
      const publishedNews = createMockNews(NewsStatus.PUBLISHED);

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(publishedNews));

      const result = await useCase.execute(newsId, 'user-1');

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Haber zaten yayında');
      expect(mockRepository.publish).not.toHaveBeenCalled();
    });

    it('should return error if repository publish fails', async () => {
      const newsId = 'news-1';
      const draftNews = createMockNews(NewsStatus.DRAFT);

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(draftNews));
      vi.mocked(mockRepository.publish).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute(newsId, 'user-1');

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Database error');
    });

    it('should publish archived news', async () => {
      const newsId = 'news-1';
      const archivedNews = createMockNews(NewsStatus.ARCHIVED);
      const publishedNews = {
        ...archivedNews,
        status: NewsStatus.PUBLISHED,
        publishedAt: new Date(),
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(archivedNews));
      vi.mocked(mockRepository.publish).mockResolvedValue(Result.ok(publishedNews));

      const result = await useCase.execute(newsId, 'user-1');

      expect(result.isSuccess).toBe(true);
      expect(result.value.status).toBe(NewsStatus.PUBLISHED);
    });
  });
});

