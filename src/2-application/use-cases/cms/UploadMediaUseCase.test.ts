import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UploadMediaUseCase, UploadMediaRequest } from './UploadMediaUseCase';
import { ICMSMediaRepository } from '@/3-domain/interfaces/repositories/ICMSMediaRepository';
import { Result } from '@/6-core/result/Result';
import { CMSMedia } from '@/3-domain/entities/CMSMedia';

describe('UploadMediaUseCase', () => {
  let mockRepository: ICMSMediaRepository;
  let useCase: UploadMediaUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;

    useCase = new UploadMediaUseCase(mockRepository);
  });

  const createMockMedia = (overrides?: Partial<CMSMedia>): CMSMedia => ({
    id: 'media-1',
    filename: 'test.jpg',
    originalFilename: 'test.jpg',
    mimeType: 'image/jpeg',
    fileSize: 1024,
    fileUrl: 'https://example.com/test.jpg',
    storagePath: 'cms/test.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const createValidRequest = (overrides?: Partial<UploadMediaRequest>): UploadMediaRequest => ({
    filename: 'test.jpg',
    originalFilename: 'test.jpg',
    mimeType: 'image/jpeg',
    fileSize: 1024,
    fileUrl: 'https://example.com/test.jpg',
    storagePath: 'cms/test.jpg',
    ...overrides,
  });

  describe('execute', () => {
    it('should upload media successfully', async () => {
      const request = createValidRequest();
      const mockMedia = createMockMedia();

      vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(mockMedia));

      const result = await useCase.execute(request, 'user-1');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockMedia);
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('should fail if file size exceeds 10MB', async () => {
      const request = createValidRequest({
        fileSize: 11 * 1024 * 1024, // 11MB
      });

      const result = await useCase.execute(request, 'user-1');

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toContain('Dosya boyutu maksimum 10MB');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should fail if MIME type is not allowed', async () => {
      const request = createValidRequest({
        mimeType: 'application/pdf', // Not allowed
      });

      const result = await useCase.execute(request, 'user-1');

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toContain('Sadece görsel ve video dosyaları');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should accept allowed image MIME types', async () => {
      const allowedImageTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
      ];

      for (const mimeType of allowedImageTypes) {
        const request = createValidRequest({ mimeType });
        const mockMedia = createMockMedia({ mimeType });

        vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(mockMedia));

        const result = await useCase.execute(request, 'user-1');

        expect(result.isSuccess).toBe(true);
        vi.clearAllMocks();
      }
    });

    it('should accept allowed video MIME types', async () => {
      const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];

      for (const mimeType of allowedVideoTypes) {
        const request = createValidRequest({ mimeType });
        const mockMedia = createMockMedia({ mimeType });

        vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(mockMedia));

        const result = await useCase.execute(request, 'user-1');

        expect(result.isSuccess).toBe(true);
        vi.clearAllMocks();
      }
    });

    it('should include alt text and caption if provided', async () => {
      const request = createValidRequest({
        altText: 'Test image',
        caption: 'Test caption',
      });

      const mockMedia = createMockMedia({
        altText: 'Test image',
        caption: 'Test caption',
      });

      vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(mockMedia));

      const result = await useCase.execute(request, 'user-1');

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          altText: 'Test image',
          caption: 'Test caption',
        }),
        'user-1'
      );
    });

    it('should fail if repository create fails', async () => {
      const request = createValidRequest();

      vi.mocked(mockRepository.create).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute(request, 'user-1');

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toBe('Database error');
    });

    it('should accept file size exactly at 10MB limit', async () => {
      const request = createValidRequest({
        fileSize: 10 * 1024 * 1024, // Exactly 10MB
      });

      const mockMedia = createMockMedia({ fileSize: 10 * 1024 * 1024 });

      vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(mockMedia));

      const result = await useCase.execute(request, 'user-1');

      expect(result.isSuccess).toBe(true);
    });
  });
});
