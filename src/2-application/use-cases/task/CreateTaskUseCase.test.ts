/**
 * Unit Tests for CreateTaskUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateTaskUseCase } from './CreateTaskUseCase';
import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { ISubProjectRepository } from '@/3-domain/interfaces/repositories/ISubProjectRepository';
import { Task } from '@/3-domain/entities/Task';

describe('CreateTaskUseCase', () => {
  let mockTaskRepository: ITaskRepository;
  let mockSubProjectRepository: ISubProjectRepository;
  let useCase: CreateTaskUseCase;

  beforeEach(() => {
    mockTaskRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findBySubProject: vi.fn(),
      findByAssignedUser: vi.fn(),
      findBySubProjectId: vi.fn(),
      complete: vi.fn(),
      approve: vi.fn(),
      reject: vi.fn(),
      assign: vi.fn(),
      exists: vi.fn(),
    };

    mockSubProjectRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
      findByProjectId: vi.fn(),
    };

    useCase = new CreateTaskUseCase(mockTaskRepository, mockSubProjectRepository);
  });

  const createValidDto = () => ({
    subProjectId: 'subproject-1',
    assignedTo: 'user-1',
    title: 'Test Task',
    description: 'Test Description',
    priority: 'high' as const,
    orderIndex: 1,
  });

  it('should create task successfully', async () => {
    const dto = createValidDto();
    const createdTask: Task = {
      id: 'task-1',
      ...dto,
      status: 'todo',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockSubProjectRepository.exists).mockResolvedValue(true);
    vi.mocked(mockTaskRepository.create).mockResolvedValue(createdTask);

    const result = await useCase.execute(dto);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.id).toBe('task-1');
    expect(mockSubProjectRepository.exists).toHaveBeenCalledWith(dto.subProjectId);
    expect(mockTaskRepository.create).toHaveBeenCalledWith(dto);
  });

  it('should return error when validation fails', async () => {
    // Invalid DTO - missing required fields
    const dto = {
      subProjectId: '',
      assignedTo: 'user-1',
      title: '',
      priority: 'high' as const,
      orderIndex: 1,
    };

    const result = await useCase.execute(dto);

    expect(result.isFailure).toBe(true);
    expect(result.error?.statusCode).toBe(400);
    expect(mockSubProjectRepository.exists).not.toHaveBeenCalled();
    expect(mockTaskRepository.create).not.toHaveBeenCalled();
  });

  it('should return error when sub-project not found', async () => {
    const dto = createValidDto();

    vi.mocked(mockSubProjectRepository.exists).mockResolvedValue(false);

    const result = await useCase.execute(dto);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Sub-project not found');
    expect(result.error?.statusCode).toBe(404);
    expect(mockTaskRepository.create).not.toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const dto = createValidDto();
    const errorMessage = 'Database error';

    vi.mocked(mockSubProjectRepository.exists).mockResolvedValue(true);
    vi.mocked(mockTaskRepository.create).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(dto);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
    expect(result.error?.statusCode).toBe(500);
  });
});
