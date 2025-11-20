/**
 * Unit Tests for UpdateSubProjectUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateSubProjectUseCase } from './UpdateSubProjectUseCase';
import { ISubProjectRepository } from '@/3-domain/interfaces/repositories/ISubProjectRepository';
import { SubProject, UpdateSubProjectDto } from '@/3-domain/entities/SubProject';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

describe('UpdateSubProjectUseCase', () => {
  let mockRepository: ISubProjectRepository;
  let useCase: UpdateSubProjectUseCase;

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

    useCase = new UpdateSubProjectUseCase(mockRepository);
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

  const createUpdateDto = (overrides?: Partial<UpdateSubProjectDto>): UpdateSubProjectDto => {
    return {
      name: 'Updated Sub-Project',
      ...overrides,
    };
  };

  describe('execute', () => {
    it('should update sub-project successfully', async () => {
      const subProjectId = 'sub-project-1';
      const updateDto = createUpdateDto();
      const updatedSubProject = createMockSubProject({
        id: subProjectId,
        name: 'Updated Sub-Project',
      });

      vi.mocked(mockRepository.exists).mockResolvedValue(true);
      vi.mocked(mockRepository.update).mockResolvedValue(updatedSubProject);

      const result = await useCase.execute(subProjectId, updateDto);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeUndefined();
      expect(mockRepository.exists).toHaveBeenCalledWith(subProjectId);
      expect(mockRepository.update).toHaveBeenCalledWith(subProjectId, updateDto);
    });

    it('should return error when sub-project is not found', async () => {
      const subProjectId = 'non-existent-sub-project';
      const updateDto = createUpdateDto();

      vi.mocked(mockRepository.exists).mockResolvedValue(false);

      const result = await useCase.execute(subProjectId, updateDto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('Sub-project not found');
      expect((result.error as AppError).statusCode).toBe(404);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should update sub-project with partial data', async () => {
      const subProjectId = 'sub-project-1';
      const updateDto: UpdateSubProjectDto = {
        description: 'Updated Description',
      };
      const updatedSubProject = createMockSubProject({
        id: subProjectId,
        description: 'Updated Description',
      });

      vi.mocked(mockRepository.exists).mockResolvedValue(true);
      vi.mocked(mockRepository.update).mockResolvedValue(updatedSubProject);

      const result = await useCase.execute(subProjectId, updateDto);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.update).toHaveBeenCalledWith(subProjectId, updateDto);
    });

    it('should update sub-project status', async () => {
      const subProjectId = 'sub-project-1';
      const updateDto: UpdateSubProjectDto = {
        status: 'in_progress',
      };
      const updatedSubProject = createMockSubProject({
        id: subProjectId,
        status: 'in_progress',
      });

      vi.mocked(mockRepository.exists).mockResolvedValue(true);
      vi.mocked(mockRepository.update).mockResolvedValue(updatedSubProject);

      const result = await useCase.execute(subProjectId, updateDto);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.update).toHaveBeenCalledWith(subProjectId, updateDto);
    });

    it('should update sub-project progress', async () => {
      const subProjectId = 'sub-project-1';
      const updateDto: UpdateSubProjectDto = {
        progress: 50,
      };
      const updatedSubProject = createMockSubProject({
        id: subProjectId,
        progress: 50,
      });

      vi.mocked(mockRepository.exists).mockResolvedValue(true);
      vi.mocked(mockRepository.update).mockResolvedValue(updatedSubProject);

      const result = await useCase.execute(subProjectId, updateDto);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.update).toHaveBeenCalledWith(subProjectId, updateDto);
    });

    it('should update sub-project order index', async () => {
      const subProjectId = 'sub-project-1';
      const updateDto: UpdateSubProjectDto = {
        orderIndex: 5,
      };
      const updatedSubProject = createMockSubProject({
        id: subProjectId,
        orderIndex: 5,
      });

      vi.mocked(mockRepository.exists).mockResolvedValue(true);
      vi.mocked(mockRepository.update).mockResolvedValue(updatedSubProject);

      const result = await useCase.execute(subProjectId, updateDto);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.update).toHaveBeenCalledWith(subProjectId, updateDto);
    });

    it('should handle repository errors during exists check', async () => {
      const subProjectId = 'sub-project-1';
      const updateDto = createUpdateDto();
      const repositoryError = new Error('Database error');

      vi.mocked(mockRepository.exists).mockRejectedValue(repositoryError);

      const result = await useCase.execute(subProjectId, updateDto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('Database error');
      expect((result.error as AppError).statusCode).toBe(500);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should handle repository errors during update', async () => {
      const subProjectId = 'sub-project-1';
      const updateDto = createUpdateDto();
      const repositoryError = new Error('Update failed');

      vi.mocked(mockRepository.exists).mockResolvedValue(true);
      vi.mocked(mockRepository.update).mockRejectedValue(repositoryError);

      const result = await useCase.execute(subProjectId, updateDto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('Update failed');
      expect((result.error as AppError).statusCode).toBe(500);
    });
  });
});
