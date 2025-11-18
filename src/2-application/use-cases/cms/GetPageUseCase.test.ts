import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetPageUseCase } from './GetPageUseCase';
import { ICMSPageRepository } from '@/3-domain/interfaces/repositories/ICMSPageRepository';
import { Result } from '@/6-core/result/Result';
import { CMSPage } from '@/3-domain/entities/CMSPage';

describe('GetPageUseCase', () => {
  let mockRepository: ICMSPageRepository;
  let useCase: GetPageUseCase;

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

    useCase = new GetPageUseCase(mockRepository);
  });

  const createMockPage = (overrides?: Partial<CMSPage>): CMSPage => ({
    id: 'page-1',
    slug: 'test-page',
    title: 'Test Page',
    content: [],
    status: 'published',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe('executeById', () => {
    it('should get a page by id successfully', async () => {
      const mockPage = createMockPage();

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockPage));

      const result = await useCase.executeById('page-1');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockPage);
      expect(mockRepository.findById).toHaveBeenCalledWith('page-1');
    });

    it('should return null if page not found', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null));

      const result = await useCase.executeById('nonexistent');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeNull();
    });

    it('should fail if repository findById fails', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.executeById('page-1');

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toBe('Database error');
    });
  });

  describe('executeBySlug', () => {
    it('should get a page by slug successfully', async () => {
      const mockPage = createMockPage({ slug: 'test-page' });

      vi.mocked(mockRepository.findBySlug).mockResolvedValue(Result.ok(mockPage));

      const result = await useCase.executeBySlug('test-page');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockPage);
      expect(mockRepository.findBySlug).toHaveBeenCalledWith('test-page', false);
    });

    it('should return null if page not found', async () => {
      vi.mocked(mockRepository.findBySlug).mockResolvedValue(Result.ok(null));

      const result = await useCase.executeBySlug('nonexistent');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeNull();
    });

    it('should include archived pages when includeArchived is true', async () => {
      const mockPage = createMockPage({ slug: 'archived-page', status: 'archived' });

      vi.mocked(mockRepository.findBySlug).mockResolvedValue(Result.ok(mockPage));

      const result = await useCase.executeBySlug('archived-page', true);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findBySlug).toHaveBeenCalledWith('archived-page', true);
    });

    it('should fail if repository findBySlug fails', async () => {
      vi.mocked(mockRepository.findBySlug).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.executeBySlug('test-page');

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toBe('Database error');
    });
  });
});
