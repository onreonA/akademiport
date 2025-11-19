/**
 * Unit Tests for UpdateTaskUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateTaskUseCase } from './UpdateTaskUseCase';
import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { ITaskDependencyRepository } from '@/3-domain/interfaces/repositories/ITaskDependencyRepository';
import { Task } from '@/3-domain/entities/Task';

describe('UpdateTaskUseCase', () => {
  let mockTaskRepository: ITaskRepository;
  let mockTaskDependencyRepository: ITaskDependencyRepository;
  let useCase: UpdateTaskUseCase;

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

    mockTaskDependencyRepository = {
      create: vi.fn(),
      findDependenciesOfTask: vi.fn(),
      findTasksThatDependOn: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    };

    useCase = new UpdateTaskUseCase(mockTaskRepository, mockTaskDependencyRepository);
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

  it('should update task successfully', async () => {
    const taskId = 'task-1';
    const updateData = { title: 'Updated Title', description: 'Updated Description' };
    const mockTask = createMockTask({ id: taskId });

    vi.mocked(mockTaskRepository.findById).mockResolvedValue(mockTask);
    vi.mocked(mockTaskRepository.update).mockResolvedValue(undefined);

    const result = await useCase.execute(taskId, updateData);

    expect(result.isSuccess).toBe(true);
    expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
    expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, updateData);
  });

  it('should return error when task not found', async () => {
    const taskId = 'non-existent';
    const updateData = { title: 'Updated Title' };

    vi.mocked(mockTaskRepository.findById).mockResolvedValue(null);

    const result = await useCase.execute(taskId, updateData);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Task not found');
    expect(result.error?.statusCode).toBe(404);
    expect(mockTaskRepository.update).not.toHaveBeenCalled();
  });

  it('should check dependencies when changing status to in_progress', async () => {
    const taskId = 'task-1';
    const updateData = { status: 'in_progress' };
    const mockTask = createMockTask({ id: taskId, status: 'todo' });

    vi.mocked(mockTaskRepository.findById).mockResolvedValue(mockTask);
    vi.mocked(mockTaskDependencyRepository.findDependenciesOfTask).mockResolvedValue([]);
    vi.mocked(mockTaskRepository.update).mockResolvedValue(undefined);

    const result = await useCase.execute(taskId, updateData);

    expect(result.isSuccess).toBe(true);
    expect(mockTaskDependencyRepository.findDependenciesOfTask).toHaveBeenCalledWith(taskId);
  });

  it('should fail when blocking dependencies are not completed', async () => {
    const taskId = 'task-1';
    const updateData = { status: 'in_progress' };
    const mockTask = createMockTask({ id: taskId, status: 'todo' });
    const blockingDependency = {
      id: 'dep-1',
      taskId: taskId,
      dependsOnTaskId: 'task-2',
      dependencyType: 'blocks' as const,
      createdAt: new Date(),
    };
    const incompleteTask = createMockTask({ id: 'task-2', status: 'todo' });

    vi.mocked(mockTaskRepository.findById)
      .mockResolvedValueOnce(mockTask)
      .mockResolvedValueOnce(incompleteTask);
    vi.mocked(mockTaskDependencyRepository.findDependenciesOfTask).mockResolvedValue([
      blockingDependency,
    ]);
    vi.mocked(mockTaskRepository.update).mockResolvedValue(undefined);

    const result = await useCase.execute(taskId, updateData);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('tamamlanmamış bağımlı görevlere sahip');
    expect(result.error?.statusCode).toBe(400);
    expect(mockTaskRepository.update).not.toHaveBeenCalled();
  });

  it('should allow status change when all blocking dependencies are completed', async () => {
    const taskId = 'task-1';
    const updateData = { status: 'in_progress' };
    const mockTask = createMockTask({ id: taskId, status: 'todo' });
    const blockingDependency = {
      id: 'dep-1',
      taskId: taskId,
      dependsOnTaskId: 'task-2',
      dependencyType: 'blocks' as const,
      createdAt: new Date(),
    };
    const completedTask = createMockTask({ id: 'task-2', status: 'done' });

    vi.mocked(mockTaskRepository.findById)
      .mockResolvedValueOnce(mockTask)
      .mockResolvedValueOnce(completedTask);
    vi.mocked(mockTaskDependencyRepository.findDependenciesOfTask).mockResolvedValue([
      blockingDependency,
    ]);
    vi.mocked(mockTaskRepository.update).mockResolvedValue(undefined);

    const result = await useCase.execute(taskId, updateData);

    expect(result.isSuccess).toBe(true);
    expect(mockTaskRepository.update).toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const taskId = 'task-1';
    const updateData = { title: 'Updated Title' };
    const errorMessage = 'Database error';

    vi.mocked(mockTaskRepository.findById).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(taskId, updateData);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
    expect(result.error?.statusCode).toBe(500);
  });
});
