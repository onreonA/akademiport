/**
 * Unit Tests for GetSubProjectUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetSubProjectUseCase } from './GetSubProjectUseCase';
import { ISubProjectRepository } from '@/3-domain/interfaces/repositories/ISubProjectRepository';
import { SubProject } from '@/3-domain/entities/SubProject';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

describe('GetSubProjectUseCase', () => {
  let mockRepository: ISubProjectRepository;
  let useCase: GetSubProjectUseCase;

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

    useCase = new GetSubProjectUseCase(mockRepository);
  });

  const createMockSubProject = (overrides?: Partial<SubProject>): SubProject => {
    return {
      id: 'sub-project-1',
      projectId: 'project-1',
      name: 'Test Sub-Project',
      description: 'Test Description',
      status: 'todo',
      orderIndex: 0,
      progress: 0,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  describe('execute', () => {
    it('should get sub-project successfully', async () => {
      const subProjectId = 'sub-project-1';
      const mockSubProject = createMockSubProject({ id: subProjectId });

      vi.mocked(mockRepository.findById).mockResolvedValue(mockSubProject);

      const result = await useCase.execute(subProjectId);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockSubProject);
      expect(mockRepository.findById).toHaveBeenCalledWith(subProjectId);
    });

    it('should return error when sub-project is not found', async () => {
      const subProjectId = 'non-existent-sub-project';

      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      const result = await useCase.execute(subProjectId);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('Sub-project not found');
      expect((result.error as AppError).statusCode).toBe(404);
      expect(mockRepository.findById).toHaveBeenCalledWith(subProjectId);
    });

    it('should handle repository errors', async () => {
      const subProjectId = 'sub-project-1';
      const repositoryError = new Error('Database error');

      vi.mocked(mockRepository.findById).mockRejectedValue(repositoryError);

      const result = await useCase.execute(subProjectId);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('Database error');
      expect((result.error as AppError).statusCode).toBe(500);
    });

    it('should get sub-project with different statuses', async () => {
      const statuses: SubProject['status'][] = [
        'todo',
        'in_progress',
        'review',
        'done',
        'cancelled',
      ];

      for (const status of statuses) {
        const subProjectId = `sub-project-${status}`;
        const mockSubProject = createMockSubProject({ id: subProjectId, status });

        vi.mocked(mockRepository.findById).mockResolvedValue(mockSubProject);

        const result = await useCase.execute(subProjectId);

        expect(result.isSuccess).toBe(true);
        expect(result.value?.status).toBe(status);
      }
    });

    it('should get sub-project with progress', async () => {
      const subProjectId = 'sub-project-1';
      const mockSubProject = createMockSubProject({
        id: subProjectId,
        progress: 75,
      });

      vi.mocked(mockRepository.findById).mockResolvedValue(mockSubProject);

      const result = await useCase.execute(subProjectId);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.progress).toBe(75);
    });
  });
});
