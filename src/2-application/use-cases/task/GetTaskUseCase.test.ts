/**
 * Unit Tests for GetTaskUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetTaskUseCase } from './GetTaskUseCase';
import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { Task } from '@/3-domain/entities/Task';

describe('GetTaskUseCase', () => {
  let mockRepository: ITaskRepository;
  let useCase: GetTaskUseCase;

  beforeEach(() => {
    mockRepository = {
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
    };

    useCase = new GetTaskUseCase(mockRepository);
  });

  const createMockTask = (overrides?: Partial<Task>): Task => {
    return {
      id: 'task-1',
      subProjectId: 'subproject-1',
      assignedTo: 'user-1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'todo',
      priority: 'high',
      orderIndex: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  it('should get task successfully', async () => {
    const taskId = 'task-1';
    const mockTask = createMockTask({ id: taskId });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockTask);

    const result = await useCase.execute(taskId);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockTask);
    expect(mockRepository.findById).toHaveBeenCalledWith(taskId);
  });

  it('should return error when task not found', async () => {
    const taskId = 'non-existent';

    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await useCase.execute(taskId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Task not found');
    expect(result.error?.statusCode).toBe(404);
    expect(mockRepository.findById).toHaveBeenCalledWith(taskId);
  });

  it('should handle repository errors', async () => {
    const taskId = 'task-1';
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findById).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(taskId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
    expect(result.error?.statusCode).toBe(500);
  });
});
