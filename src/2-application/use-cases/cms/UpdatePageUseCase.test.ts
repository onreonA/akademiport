import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdatePageUseCase } from './UpdatePageUseCase';
import { ICMSPageRepository } from '@/3-domain/interfaces/repositories/ICMSPageRepository';
import { Result } from '@/6-core/result/Result';
import { CMSPage, UpdateCMSPageDto } from '@/3-domain/entities/CMSPage';

describe('UpdatePageUseCase', () => {
  let mockRepository: ICMSPageRepository;
  let useCase: UpdatePageUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      slugExists: vi.fn(),
    } as any;

    useCase = new UpdatePageUseCase(mockRepository);
  });

  const createMockPage = (overrides?: Partial<CMSPage>): CMSPage => ({
    id: 'page-1',
    slug: 'test-page',
    title: 'Test Page',
    content: [],
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe('execute', () => {
    it('should update a page successfully', async () => {
      const existingPage = createMockPage();
      const dto: UpdateCMSPageDto = {
        title: 'Updated Title',
      };

      const updatedPage = createMockPage({ title: 'Updated Title' });

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingPage));
      vi.mocked(mockRepository.update).mockResolvedValue(Result.ok(updatedPage));

      const result = await useCase.execute('page-1', dto);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(updatedPage);
      expect(mockRepository.findById).toHaveBeenCalledWith('page-1');
      expect(mockRepository.update).toHaveBeenCalledWith('page-1', dto);
    });

    it('should fail if page not found', async () => {
      const dto: UpdateCMSPageDto = {
        title: 'Updated Title',
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null));

      const result = await useCase.execute('nonexistent', dto);

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toBe('Sayfa bulunamadı');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should fail if slug format is invalid', async () => {
      const existingPage = createMockPage();
      const dto: UpdateCMSPageDto = {
        slug: 'Invalid Slug!',
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingPage));

      const result = await useCase.execute('page-1', dto);

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toContain('Slug formatı geçersiz');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should fail if new slug already exists', async () => {
      const existingPage = createMockPage();
      const dto: UpdateCMSPageDto = {
        slug: 'existing-page',
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingPage));
      vi.mocked(mockRepository.slugExists).mockResolvedValue(Result.ok(true));

      const result = await useCase.execute('page-1', dto);

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toContain('zaten kullanılıyor');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should allow updating slug to same value', async () => {
      const existingPage = createMockPage({ slug: 'test-page' });
      const dto: UpdateCMSPageDto = {
        slug: 'test-page', // Same slug
        title: 'Updated Title',
      };

      const updatedPage = createMockPage({ slug: 'test-page', title: 'Updated Title' });

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingPage));
      vi.mocked(mockRepository.slugExists).mockResolvedValue(Result.ok(false));
      vi.mocked(mockRepository.update).mockResolvedValue(Result.ok(updatedPage));

      const result = await useCase.execute('page-1', dto);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('should fail if meta title is too long', async () => {
      const existingPage = createMockPage();
      const dto: UpdateCMSPageDto = {
        metaTitle: 'a'.repeat(61),
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingPage));

      const result = await useCase.execute('page-1', dto);

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toContain('Meta title maksimum 60 karakter');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should fail if meta description is too long', async () => {
      const existingPage = createMockPage();
      const dto: UpdateCMSPageDto = {
        metaDescription: 'a'.repeat(161),
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingPage));

      const result = await useCase.execute('page-1', dto);

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toContain('Meta description maksimum 160 karakter');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should fail if repository update fails', async () => {
      const existingPage = createMockPage();
      const dto: UpdateCMSPageDto = {
        title: 'Updated Title',
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingPage));
      vi.mocked(mockRepository.update).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute('page-1', dto);

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toBe('Database error');
    });

    it('should fail if findById fails', async () => {
      const dto: UpdateCMSPageDto = {
        title: 'Updated Title',
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute('page-1', dto);

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toBe('Database error');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });
});
