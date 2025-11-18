import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreatePageUseCase } from './CreatePageUseCase';
import { ICMSPageRepository } from '@/3-domain/interfaces/repositories/ICMSPageRepository';
import { Result } from '@/6-core/result/Result';
import { CMSPage, CreateCMSPageDto } from '@/3-domain/entities/CMSPage';

describe('CreatePageUseCase', () => {
  let mockRepository: ICMSPageRepository;
  let useCase: CreatePageUseCase;

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

    useCase = new CreatePageUseCase(mockRepository);
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
    it('should create a page successfully', async () => {
      const dto: CreateCMSPageDto = {
        slug: 'test-page',
        title: 'Test Page',
        content: [],
        status: 'draft',
      };

      const mockPage = createMockPage();

      vi.mocked(mockRepository.slugExists).mockResolvedValue(Result.ok(false));
      vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(mockPage));

      const result = await useCase.execute(dto, 'user-1');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockPage);
      expect(mockRepository.slugExists).toHaveBeenCalledWith('test-page');
      expect(mockRepository.create).toHaveBeenCalledWith(
        {
          ...dto,
          status: 'draft',
          content: [],
        },
        'user-1'
      );
    });

    it('should fail if slug format is invalid', async () => {
      const dto: CreateCMSPageDto = {
        slug: 'Invalid Slug!',
        title: 'Test Page',
      };

      const result = await useCase.execute(dto, 'user-1');

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toContain('Slug formatı geçersiz');
      expect(mockRepository.slugExists).not.toHaveBeenCalled();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should fail if slug already exists', async () => {
      const dto: CreateCMSPageDto = {
        slug: 'existing-page',
        title: 'Test Page',
      };

      vi.mocked(mockRepository.slugExists).mockResolvedValue(Result.ok(true));

      const result = await useCase.execute(dto, 'user-1');

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toContain('zaten kullanılıyor');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should fail if meta title is too long', async () => {
      const dto: CreateCMSPageDto = {
        slug: 'test-page',
        title: 'Test Page',
        metaTitle: 'a'.repeat(61), // 61 characters
      };

      vi.mocked(mockRepository.slugExists).mockResolvedValue(Result.ok(false));

      const result = await useCase.execute(dto, 'user-1');

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toContain('Meta title maksimum 60 karakter');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should fail if meta description is too long', async () => {
      const dto: CreateCMSPageDto = {
        slug: 'test-page',
        title: 'Test Page',
        metaDescription: 'a'.repeat(161), // 161 characters
      };

      vi.mocked(mockRepository.slugExists).mockResolvedValue(Result.ok(false));

      const result = await useCase.execute(dto, 'user-1');

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toContain('Meta description maksimum 160 karakter');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should use default status and content if not provided', async () => {
      const dto: CreateCMSPageDto = {
        slug: 'test-page',
        title: 'Test Page',
      };

      const mockPage = createMockPage();

      vi.mocked(mockRepository.slugExists).mockResolvedValue(Result.ok(false));
      vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(mockPage));

      const result = await useCase.execute(dto, 'user-1');

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.create).toHaveBeenCalledWith(
        {
          ...dto,
          status: 'draft',
          content: [],
        },
        'user-1'
      );
    });

    it('should fail if repository create fails', async () => {
      const dto: CreateCMSPageDto = {
        slug: 'test-page',
        title: 'Test Page',
      };

      vi.mocked(mockRepository.slugExists).mockResolvedValue(Result.ok(false));
      vi.mocked(mockRepository.create).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute(dto, 'user-1');

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toBe('Database error');
    });

    it('should fail if slugExists check fails', async () => {
      const dto: CreateCMSPageDto = {
        slug: 'test-page',
        title: 'Test Page',
      };

      vi.mocked(mockRepository.slugExists).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute(dto, 'user-1');

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toBe('Database error');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should accept valid slug formats', async () => {
      const validSlugs = ['test', 'test-page', 'test-page-123', '123', 'page-1-2-3'];

      for (const slug of validSlugs) {
        const dto: CreateCMSPageDto = {
          slug,
          title: 'Test Page',
        };

        const mockPage = createMockPage({ slug });

        vi.mocked(mockRepository.slugExists).mockResolvedValue(Result.ok(false));
        vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(mockPage));

        const result = await useCase.execute(dto, 'user-1');

        expect(result.isSuccess).toBe(true);
        vi.clearAllMocks();
      }
    });
  });
});
