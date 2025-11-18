import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetPagesUseCase } from './GetPagesUseCase';
import {
  ICMSPageRepository,
  CMSPageFilter,
} from '@/3-domain/interfaces/repositories/ICMSPageRepository';
import { Result } from '@/6-core/result/Result';
import { CMSPage } from '@/3-domain/entities/CMSPage';

describe('GetPagesUseCase', () => {
  let mockRepository: ICMSPageRepository;
  let useCase: GetPagesUseCase;

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

    useCase = new GetPagesUseCase(mockRepository);
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

  describe('execute', () => {
    it('should get all pages successfully', async () => {
      const mockPages = [createMockPage(), createMockPage({ id: 'page-2', slug: 'page-2' })];

      vi.mocked(mockRepository.findMany).mockResolvedValue(Result.ok(mockPages));

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockPages);
      expect(mockRepository.findMany).toHaveBeenCalledWith(undefined);
    });

    it('should get pages with filter', async () => {
      const filter: CMSPageFilter = {
        status: 'published',
        search: 'test',
      };

      const mockPages = [createMockPage()];

      vi.mocked(mockRepository.findMany).mockResolvedValue(Result.ok(mockPages));

      const result = await useCase.execute(filter);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockPages);
      expect(mockRepository.findMany).toHaveBeenCalledWith(filter);
    });

    it('should return empty array if no pages found', async () => {
      vi.mocked(mockRepository.findMany).mockResolvedValue(Result.ok([]));

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual([]);
    });

    it('should fail if repository findMany fails', async () => {
      vi.mocked(mockRepository.findMany).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toBe('Database error');
    });

    it('should filter by status', async () => {
      const filter: CMSPageFilter = {
        status: 'draft',
      };

      const mockPages = [createMockPage({ status: 'draft' })];

      vi.mocked(mockRepository.findMany).mockResolvedValue(Result.ok(mockPages));

      const result = await useCase.execute(filter);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findMany).toHaveBeenCalledWith(filter);
    });

    it('should filter by search term', async () => {
      const filter: CMSPageFilter = {
        search: 'test',
      };

      const mockPages = [createMockPage({ title: 'Test Page' })];

      vi.mocked(mockRepository.findMany).mockResolvedValue(Result.ok(mockPages));

      const result = await useCase.execute(filter);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findMany).toHaveBeenCalledWith(filter);
    });
  });
});
