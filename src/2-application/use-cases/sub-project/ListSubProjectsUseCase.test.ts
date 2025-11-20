/**
 * Unit Tests for ListSubProjectsUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListSubProjectsUseCase } from './ListSubProjectsUseCase';
import { ISubProjectRepository } from '@/3-domain/interfaces/repositories/ISubProjectRepository';
import { SubProject } from '@/3-domain/entities/SubProject';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

describe('ListSubProjectsUseCase', () => {
  let mockRepository: ISubProjectRepository;
  let useCase: ListSubProjectsUseCase;

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

    useCase = new ListSubProjectsUseCase(mockRepository);
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
    it('should list sub-projects successfully', async () => {
      const projectId = 'project-1';
      const mockSubProjects = [
        createMockSubProject({ id: 'sub-project-1', projectId }),
        createMockSubProject({ id: 'sub-project-2', projectId }),
      ];

      vi.mocked(mockRepository.findByProjectId).mockResolvedValue(mockSubProjects);

      const result = await useCase.execute(projectId);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockSubProjects);
      expect(mockRepository.findByProjectId).toHaveBeenCalledWith(projectId);
    });

    it('should return empty array when no sub-projects found', async () => {
      const projectId = 'project-1';

      vi.mocked(mockRepository.findByProjectId).mockResolvedValue([]);

      const result = await useCase.execute(projectId);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual([]);
      expect(mockRepository.findByProjectId).toHaveBeenCalledWith(projectId);
    });

    it('should list sub-projects with different statuses', async () => {
      const projectId = 'project-1';
      const mockSubProjects = [
        createMockSubProject({ id: 'sub-project-1', projectId, status: 'todo' }),
        createMockSubProject({ id: 'sub-project-2', projectId, status: 'in_progress' }),
        createMockSubProject({ id: 'sub-project-3', projectId, status: 'done' }),
      ];

      vi.mocked(mockRepository.findByProjectId).mockResolvedValue(mockSubProjects);

      const result = await useCase.execute(projectId);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toHaveLength(3);
    });

    it('should list sub-projects ordered by orderIndex', async () => {
      const projectId = 'project-1';
      const mockSubProjects = [
        createMockSubProject({ id: 'sub-project-1', projectId, orderIndex: 2 }),
        createMockSubProject({ id: 'sub-project-2', projectId, orderIndex: 0 }),
        createMockSubProject({ id: 'sub-project-3', projectId, orderIndex: 1 }),
      ];

      vi.mocked(mockRepository.findByProjectId).mockResolvedValue(mockSubProjects);

      const result = await useCase.execute(projectId);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toHaveLength(3);
    });

    it('should handle repository errors', async () => {
      const projectId = 'project-1';
      const repositoryError = new Error('Database error');

      vi.mocked(mockRepository.findByProjectId).mockRejectedValue(repositoryError);

      const result = await useCase.execute(projectId);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('Database error');
      expect((result.error as AppError).statusCode).toBe(500);
    });

    it('should list sub-projects with progress', async () => {
      const projectId = 'project-1';
      const mockSubProjects = [
        createMockSubProject({ id: 'sub-project-1', projectId, progress: 0 }),
        createMockSubProject({ id: 'sub-project-2', projectId, progress: 50 }),
        createMockSubProject({ id: 'sub-project-3', projectId, progress: 100 }),
      ];

      vi.mocked(mockRepository.findByProjectId).mockResolvedValue(mockSubProjects);

      const result = await useCase.execute(projectId);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toHaveLength(3);
      expect(result.value?.[0].progress).toBe(0);
      expect(result.value?.[1].progress).toBe(50);
      expect(result.value?.[2].progress).toBe(100);
    });
  });
});
