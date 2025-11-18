import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeletePageUseCase } from './DeletePageUseCase';
import { ICMSPageRepository } from '@/3-domain/interfaces/repositories/ICMSPageRepository';
import { Result } from '@/6-core/result/Result';
import { CMSPage } from '@/3-domain/entities/CMSPage';

describe('DeletePageUseCase', () => {
  let mockRepository: ICMSPageRepository;
  let useCase: DeletePageUseCase;

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

    useCase = new DeletePageUseCase(mockRepository);
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
    it('should delete a page successfully', async () => {
      const existingPage = createMockPage();

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingPage));
      vi.mocked(mockRepository.delete).mockResolvedValue(Result.ok(undefined));

      const result = await useCase.execute('page-1');

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findById).toHaveBeenCalledWith('page-1');
      expect(mockRepository.delete).toHaveBeenCalledWith('page-1');
    });

    it('should fail if page not found', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null));

      const result = await useCase.execute('nonexistent');

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toBe('Sayfa bulunamadı');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should fail if findById fails', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute('page-1');

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toBe('Database error');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should fail if repository delete fails', async () => {
      const existingPage = createMockPage();

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingPage));
      vi.mocked(mockRepository.delete).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute('page-1');

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toBe('Database error');
    });
  });
});
