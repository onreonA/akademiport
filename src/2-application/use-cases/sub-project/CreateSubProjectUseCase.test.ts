/**
 * Unit Tests for CreateSubProjectUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateSubProjectUseCase } from './CreateSubProjectUseCase';
import { ISubProjectRepository } from '@/3-domain/interfaces/repositories/ISubProjectRepository';
import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { SubProject, CreateSubProjectDto } from '@/3-domain/entities/SubProject';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

describe('CreateSubProjectUseCase', () => {
  let mockSubProjectRepository: ISubProjectRepository;
  let mockProjectRepository: IProjectRepository;
  let useCase: CreateSubProjectUseCase;

  beforeEach(() => {
    mockSubProjectRepository = {
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

    mockProjectRepository = {
      exists: vi.fn(),
    } as any;

    useCase = new CreateSubProjectUseCase(mockSubProjectRepository, mockProjectRepository);
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

  const createValidDto = (overrides?: Partial<CreateSubProjectDto>): CreateSubProjectDto => {
    return {
      projectId: 'project-1',
      name: 'Test Sub-Project',
      description: 'Test Description',
      status: 'todo',
      orderIndex: 0,
      ...overrides,
    };
  };

  describe('execute', () => {
    it('should create sub-project successfully', async () => {
      const dto = createValidDto();
      const mockSubProject = createMockSubProject();

      vi.mocked(mockProjectRepository.exists).mockResolvedValue(true);
      vi.mocked(mockSubProjectRepository.create).mockResolvedValue(mockSubProject);

      const result = await useCase.execute(dto);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.id).toBe(mockSubProject.id);
      expect(mockProjectRepository.exists).toHaveBeenCalledWith(dto.projectId);
      expect(mockSubProjectRepository.create).toHaveBeenCalledWith(dto);
    });

    it('should return error when project ID is empty', async () => {
      const dto = createValidDto({ projectId: '' });

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('Project ID is required');
      expect((result.error as AppError).statusCode).toBe(400);
      expect(mockProjectRepository.exists).not.toHaveBeenCalled();
      expect(mockSubProjectRepository.create).not.toHaveBeenCalled();
    });

    it('should return error when sub-project name is empty', async () => {
      const dto = createValidDto({ name: '' });

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('SubProject name is required');
      expect((result.error as AppError).statusCode).toBe(400);
      expect(mockSubProjectRepository.create).not.toHaveBeenCalled();
    });

    it('should return error when sub-project name is only whitespace', async () => {
      const dto = createValidDto({ name: '   ' });

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('SubProject name is required');
      expect(mockSubProjectRepository.create).not.toHaveBeenCalled();
    });

    it('should return error when sub-project name exceeds 255 characters', async () => {
      const dto = createValidDto({ name: 'a'.repeat(256) });

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain(
        'SubProject name must be less than 255 characters'
      );
      expect((result.error as AppError).statusCode).toBe(400);
      expect(mockSubProjectRepository.create).not.toHaveBeenCalled();
    });

    it('should return error when order index is negative', async () => {
      const dto = createValidDto({ orderIndex: -1 });

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('Order index must be positive');
      expect((result.error as AppError).statusCode).toBe(400);
      expect(mockSubProjectRepository.create).not.toHaveBeenCalled();
    });

    it('should return error when project does not exist', async () => {
      const dto = createValidDto();

      vi.mocked(mockProjectRepository.exists).mockResolvedValue(false);

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('Project not found');
      expect((result.error as AppError).statusCode).toBe(404);
      expect(mockSubProjectRepository.create).not.toHaveBeenCalled();
    });

    it('should create sub-project with minimal required fields', async () => {
      const dto: CreateSubProjectDto = {
        projectId: 'project-1',
        name: 'Minimal Sub-Project',
      };
      const mockSubProject = createMockSubProject({
        name: 'Minimal Sub-Project',
        description: null,
        status: 'todo',
        orderIndex: 0,
      });

      vi.mocked(mockProjectRepository.exists).mockResolvedValue(true);
      vi.mocked(mockSubProjectRepository.create).mockResolvedValue(mockSubProject);

      const result = await useCase.execute(dto);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.id).toBe(mockSubProject.id);
    });

    it('should create sub-project with all fields', async () => {
      const dto = createValidDto({
        name: 'Complete Sub-Project',
        description: 'Complete Description',
        status: 'in_progress',
        orderIndex: 5,
      });
      const mockSubProject = createMockSubProject({
        name: 'Complete Sub-Project',
        description: 'Complete Description',
        status: 'in_progress',
        orderIndex: 5,
      });

      vi.mocked(mockProjectRepository.exists).mockResolvedValue(true);
      vi.mocked(mockSubProjectRepository.create).mockResolvedValue(mockSubProject);

      const result = await useCase.execute(dto);

      expect(result.isSuccess).toBe(true);
      expect(mockSubProjectRepository.create).toHaveBeenCalledWith(dto);
    });

    it('should handle repository errors', async () => {
      const dto = createValidDto();
      const repositoryError = new Error('Database error');

      vi.mocked(mockProjectRepository.exists).mockResolvedValue(true);
      vi.mocked(mockSubProjectRepository.create).mockRejectedValue(repositoryError);

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      expect((result.error as AppError).message).toContain('Database error');
      expect((result.error as AppError).statusCode).toBe(500);
    });

    it('should handle multiple validation errors', async () => {
      const dto = createValidDto({
        projectId: '',
        name: '',
        orderIndex: -1,
      });

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
      const errorMessage = (result.error as AppError).message;
      expect(errorMessage).toContain('Project ID is required');
      expect(errorMessage).toContain('SubProject name is required');
      expect(errorMessage).toContain('Order index must be positive');
    });
  });
});
