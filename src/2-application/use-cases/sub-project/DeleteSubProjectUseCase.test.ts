/**
 * Unit Tests for DeleteSubProjectUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteSubProjectUseCase } from './DeleteSubProjectUseCase';
import { ISubProjectRepository } from '@/3-domain/interfaces/repositories/ISubProjectRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

describe('DeleteSubProjectUseCase', () => {
  let mockRepository: ISubProjectRepository;
  let useCase: DeleteSubProjectUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByProjectId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      restore: vi.fn(),
      findDeleted: vi.fn(),
      exists: vi.fn(),
      updateProgress: vi.fn(),
      updateOrder: vi.fn(),
    } as any;

    useCase = new DeleteSubProjectUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should delete sub-project successfully', async () => {
      const subProjectId = 'sub-project-1';

      vi.mocked(mockRepository.exists).mockResolvedValue(true);
      vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

      const result = await useCase.execute(subProjectId);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeUndefined();
      expect(mockRepository.exists).toHaveBeenCalledWith(subProjectId);
      expect(mockRepository.delete).toHaveBeenCalledWith(subProjectId);
    });

    it('should return error when sub-project is not found', async () => {
      const subProjectId = 'non-existent-sub-project';

      vi.mocked(mockRepository.exists).mockResolvedValue(false);

      const result = await useCase.execute(subProjectId);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('Sub-project not found');
      expect((result.error as AppError).statusCode).toBe(404);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository errors during exists check', async () => {
      const subProjectId = 'sub-project-1';
      const repositoryError = new Error('Database error');

      vi.mocked(mockRepository.exists).mockRejectedValue(repositoryError);

      const result = await useCase.execute(subProjectId);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('Database error');
      expect((result.error as AppError).statusCode).toBe(500);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository errors during delete', async () => {
      const subProjectId = 'sub-project-1';
      const repositoryError = new Error('Delete failed');

      vi.mocked(mockRepository.exists).mockResolvedValue(true);
      vi.mocked(mockRepository.delete).mockRejectedValue(repositoryError);

      const result = await useCase.execute(subProjectId);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('Delete failed');
      expect((result.error as AppError).statusCode).toBe(500);
    });
  });
});
