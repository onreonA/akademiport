import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateNewsUseCase } from './UpdateNewsUseCase';
import { INewsRepository } from '@/3-domain/interfaces/repositories/INewsRepository';
import { NewsCategory, NewsStatus } from '@/3-domain/enums/NewsEnums';
import { Result } from '@/6-core/result/Result';
import type { News } from '@/3-domain/entities/News';
import { UpdateNewsDto } from '@/2-application/dtos/news';

describe('UpdateNewsUseCase', () => {
  let mockRepository: INewsRepository;
  let useCase: UpdateNewsUseCase;

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

    useCase = new UpdateNewsUseCase(mockRepository);
  });

  const createMockNews = (): News => ({
    id: 'news-1',
    programId: 'program-1',
    authorId: 'author-1',
    title: 'Original Title',
    slug: 'original-title',
    summary: 'Original summary',
    content: 'Original content',
    category: NewsCategory.GENERAL,
    status: NewsStatus.DRAFT,
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
    publishedAt: null,
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'author-1',
    updatedBy: 'author-1',
  });

  describe('execute', () => {
    it('should update news successfully with valid DTO', async () => {
      const newsId = 'news-1';
      const existingNews = createMockNews();
      const updatedNews = {
        ...existingNews,
        title: 'Updated Title',
        updatedBy: 'user-1',
      };
      const dto: UpdateNewsDto = {
        title: 'Updated Title',
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingNews));
      vi.mocked(mockRepository.update).mockResolvedValue(Result.ok(updatedNews));
      vi.mocked(mockRepository.getNewsTags).mockResolvedValue(Result.ok([]));

      const result = await useCase.execute(newsId, dto, 'user-1');

      expect(result.isSuccess).toBe(true);
      expect(result.value.title).toBe('Updated Title');
      expect(mockRepository.findById).toHaveBeenCalledWith(newsId);
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('should return error if news not found', async () => {
      const newsId = 'non-existent';
      const dto: UpdateNewsDto = { title: 'Updated Title' };

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null));

      const result = await useCase.execute(newsId, dto, 'user-1');

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Haber bulunamadı');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should recalculate reading time when content changes', async () => {
      const newsId = 'news-1';
      const existingNews = createMockNews();
      const updatedNews = {
        ...existingNews,
        content: 'word '.repeat(400),
        readingTime: 2,
      };
      const dto: UpdateNewsDto = {
        content: 'word '.repeat(400),
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingNews));
      vi.mocked(mockRepository.update).mockResolvedValue(Result.ok(updatedNews));
      vi.mocked(mockRepository.getNewsTags).mockResolvedValue(Result.ok([]));

      await useCase.execute(newsId, dto, 'user-1');

      const updateCall = vi.mocked(mockRepository.update).mock.calls[0][1];
      expect(updateCall.readingTime).toBeGreaterThan(1);
    });

    it('should not recalculate reading time when content unchanged', async () => {
      const newsId = 'news-1';
      const existingNews = createMockNews();
      const updatedNews = {
        ...existingNews,
        title: 'Updated Title',
      };
      const dto: UpdateNewsDto = {
        title: 'Updated Title',
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingNews));
      vi.mocked(mockRepository.update).mockResolvedValue(Result.ok(updatedNews));
      vi.mocked(mockRepository.getNewsTags).mockResolvedValue(Result.ok([]));

      await useCase.execute(newsId, dto, 'user-1');

      const updateCall = vi.mocked(mockRepository.update).mock.calls[0][1];
      expect(updateCall.readingTime).toBeUndefined();
    });

    it('should update tags correctly (add new tags)', async () => {
      const newsId = 'news-1';
      const existingNews = createMockNews();
      const updatedNews = { ...existingNews };
      const dto: UpdateNewsDto = {
        tags: ['tag-1', 'tag-2'],
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingNews));
      vi.mocked(mockRepository.update).mockResolvedValue(Result.ok(updatedNews));
      vi.mocked(mockRepository.getNewsTags).mockResolvedValue(Result.ok([]));
      vi.mocked(mockRepository.addTagToNews).mockResolvedValue(Result.ok(undefined));

      await useCase.execute(newsId, dto, 'user-1');

      expect(mockRepository.addTagToNews).toHaveBeenCalledTimes(2);
      expect(mockRepository.addTagToNews).toHaveBeenCalledWith(newsId, 'tag-1');
      expect(mockRepository.addTagToNews).toHaveBeenCalledWith(newsId, 'tag-2');
    });

    it('should update tags correctly (remove old tags)', async () => {
      const newsId = 'news-1';
      const existingNews = createMockNews();
      const updatedNews = { ...existingNews };
      const dto: UpdateNewsDto = {
        tags: ['tag-2'],
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingNews));
      vi.mocked(mockRepository.update).mockResolvedValue(Result.ok(updatedNews));
      vi.mocked(mockRepository.getNewsTags).mockResolvedValue(
        Result.ok([
          { id: 'tag-1', name: 'Tag 1', slug: 'tag-1', usageCount: 1, createdAt: new Date() },
          { id: 'tag-2', name: 'Tag 2', slug: 'tag-2', usageCount: 1, createdAt: new Date() },
        ])
      );
      vi.mocked(mockRepository.removeTagFromNews).mockResolvedValue(Result.ok(undefined));
      vi.mocked(mockRepository.addTagToNews).mockResolvedValue(Result.ok(undefined));

      await useCase.execute(newsId, dto, 'user-1');

      expect(mockRepository.removeTagFromNews).toHaveBeenCalledWith(newsId, 'tag-1');
      expect(mockRepository.addTagToNews).not.toHaveBeenCalled();
    });

    it('should return error for invalid DTO (empty title)', async () => {
      const newsId = 'news-1';
      const existingNews = createMockNews();
      const dto: UpdateNewsDto = {
        title: '',
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingNews));

      const result = await useCase.execute(newsId, dto, 'user-1');

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Haber başlığı gereklidir');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should return error if repository update fails', async () => {
      const newsId = 'news-1';
      const existingNews = createMockNews();
      const dto: UpdateNewsDto = {
        title: 'Updated Title',
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingNews));
      vi.mocked(mockRepository.update).mockResolvedValue(Result.fail('Database error'));
      vi.mocked(mockRepository.getNewsTags).mockResolvedValue(Result.ok([]));

      const result = await useCase.execute(newsId, dto, 'user-1');

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Database error');
    });
  });
});
