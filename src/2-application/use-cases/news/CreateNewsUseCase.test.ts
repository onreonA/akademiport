import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateNewsUseCase } from './CreateNewsUseCase';
import { INewsRepository } from '@/3-domain/interfaces/repositories/INewsRepository';
import { NewsCategory, NewsStatus } from '@/3-domain/enums/NewsEnums';
import { Result } from '@/6-core/result/Result';
import type { News } from '@/3-domain/entities/News';
import { CreateNewsDto } from '@/2-application/dtos/news';

describe('CreateNewsUseCase', () => {
  let mockRepository: INewsRepository;
  let useCase: CreateNewsUseCase;

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

    useCase = new CreateNewsUseCase(mockRepository);
  });

  const createValidDto = (): CreateNewsDto => ({
    programId: 'program-1',
    authorId: 'author-1',
    title: 'Test Haber Başlığı',
    content: 'Test içerik',
    category: NewsCategory.GENERAL,
  });

  const createMockNews = (): News => ({
    id: 'news-1',
    programId: 'program-1',
    authorId: 'author-1',
    title: 'Test Haber Başlığı',
    slug: 'test-haber-basligi',
    summary: null,
    content: 'Test içerik',
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
    it('should create news successfully with valid DTO', async () => {
      const dto = createValidDto();
      const mockNews = createMockNews();

      vi.mocked(mockRepository.findBySlug).mockResolvedValue(Result.ok(null));
      vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(mockNews));
      vi.mocked(mockRepository.addTagToNews).mockResolvedValue(Result.ok(undefined));

      const result = await useCase.execute(dto);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockNews);
      expect(mockRepository.findBySlug).toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('should generate slug from title', async () => {
      const dto = createValidDto();
      const mockNews = createMockNews();

      vi.mocked(mockRepository.findBySlug).mockResolvedValue(Result.ok(null));
      vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(mockNews));

      await useCase.execute(dto);

      const createCall = vi.mocked(mockRepository.create).mock.calls[0][0];
      expect(createCall.slug).toBe('test-haber-basligi');
    });

    it('should handle Turkish characters in slug generation', async () => {
      const dto = {
        ...createValidDto(),
        title: 'E-ticaret ve E-ihracat Haberleri',
      };
      const mockNews = createMockNews();

      vi.mocked(mockRepository.findBySlug).mockResolvedValue(Result.ok(null));
      vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(mockNews));

      await useCase.execute(dto);

      const createCall = vi.mocked(mockRepository.create).mock.calls[0][0];
      expect(createCall.slug).toContain('e-ticaret');
      expect(createCall.slug).not.toContain('ş');
      expect(createCall.slug).not.toContain('ç');
    });

    it('should return error if slug already exists', async () => {
      const dto = createValidDto();
      const existingNews = createMockNews();

      vi.mocked(mockRepository.findBySlug).mockResolvedValue(Result.ok(existingNews));

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Bu başlıkta bir haber zaten mevcut');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should set status to DRAFT by default', async () => {
      const dto = createValidDto();
      const mockNews = createMockNews();

      vi.mocked(mockRepository.findBySlug).mockResolvedValue(Result.ok(null));
      vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(mockNews));

      await useCase.execute(dto);

      const createCall = vi.mocked(mockRepository.create).mock.calls[0][0];
      expect(createCall.status).toBe(NewsStatus.DRAFT);
    });

    it('should calculate reading time', async () => {
      const dto = {
        ...createValidDto(),
        content: 'word '.repeat(400), // ~2 minutes
      };
      const mockNews = createMockNews();

      vi.mocked(mockRepository.findBySlug).mockResolvedValue(Result.ok(null));
      vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(mockNews));

      await useCase.execute(dto);

      const createCall = vi.mocked(mockRepository.create).mock.calls[0][0];
      expect(createCall.readingTime).toBeGreaterThan(0);
    });

    it('should add tags if provided', async () => {
      const dto = {
        ...createValidDto(),
        tags: ['tag-1', 'tag-2'],
      };
      const mockNews = createMockNews();

      vi.mocked(mockRepository.findBySlug).mockResolvedValue(Result.ok(null));
      vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(mockNews));
      vi.mocked(mockRepository.addTagToNews).mockResolvedValue(Result.ok(undefined));

      await useCase.execute(dto);

      expect(mockRepository.addTagToNews).toHaveBeenCalledTimes(2);
      expect(mockRepository.addTagToNews).toHaveBeenCalledWith('news-1', 'tag-1');
      expect(mockRepository.addTagToNews).toHaveBeenCalledWith('news-1', 'tag-2');
    });

    it('should return error for invalid DTO (empty title)', async () => {
      const dto = {
        ...createValidDto(),
        title: '',
      };

      vi.mocked(mockRepository.findBySlug).mockResolvedValue(Result.ok(null));

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Haber başlığı gereklidir');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should return error for invalid DTO (empty content)', async () => {
      const dto = {
        ...createValidDto(),
        content: '',
      };

      vi.mocked(mockRepository.findBySlug).mockResolvedValue(Result.ok(null));

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Haber içeriği gereklidir');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should return error if repository create fails', async () => {
      const dto = createValidDto();

      vi.mocked(mockRepository.findBySlug).mockResolvedValue(Result.ok(null));
      vi.mocked(mockRepository.create).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Database error');
    });

    it('should handle optional fields correctly', async () => {
      const dto = {
        ...createValidDto(),
        summary: 'Test özet',
        imageUrl: 'https://example.com/image.jpg',
        imageAlt: 'Test image',
        metaDescription: 'Test meta',
        metaKeywords: ['test', 'keyword'],
        isFeatured: true,
        isPinned: true,
      };
      const mockNews = createMockNews();

      vi.mocked(mockRepository.findBySlug).mockResolvedValue(Result.ok(null));
      vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(mockNews));

      await useCase.execute(dto);

      const createCall = vi.mocked(mockRepository.create).mock.calls[0][0];
      expect(createCall.summary).toBe('Test özet');
      expect(createCall.imageUrl).toBe('https://example.com/image.jpg');
      expect(createCall.imageAlt).toBe('Test image');
      expect(createCall.metaDescription).toBe('Test meta');
      expect(createCall.metaKeywords).toEqual(['test', 'keyword']);
      expect(createCall.isFeatured).toBe(true);
      expect(createCall.isPinned).toBe(true);
    });
  });
});

