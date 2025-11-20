/**
 * Unit Tests for ListTasksUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListTasksUseCase } from './ListTasksUseCase';
import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { Task } from '@/3-domain/entities/Task';
import { AppError } from '@/6-core/errors/AppError';

describe('ListTasksUseCase', () => {
  let mockRepository: ITaskRepository;
  let useCase: ListTasksUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findBySubProjectId: vi.fn(),
      findBySubProjectIds: vi.fn(),
      findByAssignedUserId: vi.fn(),
      complete: vi.fn(),
      approve: vi.fn(),
      reject: vi.fn(),
      assign: vi.fn(),
      assignTo: vi.fn(),
      exists: vi.fn(),
      restore: vi.fn(),
    } as any;

    useCase = new ListTasksUseCase(mockRepository);
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
      dueDate: null,
      completedAt: null,
      approvedAt: null,
      approvedBy: null,
      orderIndex: 1,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  it('should list tasks successfully', async () => {
    const subProjectId = 'subproject-1';
    const mockTasks = [
      createMockTask({ id: 'task-1', subProjectId }),
      createMockTask({ id: 'task-2', subProjectId }),
    ];

    vi.mocked(mockRepository.findBySubProjectId).mockResolvedValue(mockTasks);

    const result = await useCase.execute(subProjectId);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockTasks);
    expect(mockRepository.findBySubProjectId).toHaveBeenCalledWith(subProjectId);
  });

  it('should return empty array when no tasks found', async () => {
    const subProjectId = 'subproject-1';

    vi.mocked(mockRepository.findBySubProjectId).mockResolvedValue([]);

    const result = await useCase.execute(subProjectId);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual([]);
    expect(mockRepository.findBySubProjectId).toHaveBeenCalledWith(subProjectId);
  });

  it('should handle repository errors', async () => {
    const subProjectId = 'subproject-1';
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findBySubProjectId).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(subProjectId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
    expect((result.error as AppError)?.statusCode).toBe(500);
  });
});
