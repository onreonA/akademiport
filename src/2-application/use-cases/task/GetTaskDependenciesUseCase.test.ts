/**
 * Unit Tests for GetTaskDependenciesUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetTaskDependenciesUseCase } from './GetTaskDependenciesUseCase';
import { ITaskDependencyRepository } from '@/3-domain/interfaces/repositories/ITaskDependencyRepository';
import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { Result } from '@/6-core/result/Result';
import type { TaskDependency } from '@/3-domain/entities/TaskDependency';
import type { Task } from '@/3-domain/entities/Task';

describe('GetTaskDependenciesUseCase', () => {
  let mockTaskDependencyRepository: ITaskDependencyRepository;
  let mockTaskRepository: ITaskRepository;
  let useCase: GetTaskDependenciesUseCase;

  beforeEach(() => {
    mockTaskDependencyRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByTaskId: vi.fn(),
      findDependenciesOfTask: vi.fn(),
      findDependentTasks: vi.fn(),
      exists: vi.fn(),
      checkCircularDependency: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteByTaskId: vi.fn(),
    } as any;

    mockTaskRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findBySubProjectId: vi.fn(),
      findBySubProjectIds: vi.fn(),
      findByAssignedUserId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      restore: vi.fn(),
      findDeleted: vi.fn(),
      exists: vi.fn(),
      updateStatus: vi.fn(),
      complete: vi.fn(),
      approve: vi.fn(),
      reject: vi.fn(),
      assignTo: vi.fn(),
      updateOrder: vi.fn(),
    } as any;

    useCase = new GetTaskDependenciesUseCase(mockTaskDependencyRepository, mockTaskRepository);
  });

  const createMockTask = (overrides?: Partial<Task>): Task => {
    return {
      id: 'task-1',
      subProjectId: 'subproject-1',
      title: 'Test Task',
      description: 'Test description',
      status: 'todo',
      priority: 'medium',
      assignedTo: null,
      orderIndex: 1,
      dueDate: null,
      completedAt: null,
      approvedAt: null,
      approvedBy: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  const createMockDependency = (overrides?: Partial<TaskDependency>): TaskDependency => {
    return {
      id: 'dependency-1',
      taskId: 'task-1',
      dependsOnTaskId: 'task-2',
      dependencyType: 'blocks',
      createdAt: new Date(),
      ...overrides,
    };
  };

  describe('execute', () => {
    it('should get dependencies and dependents successfully', async () => {
      const taskId = 'task-1';
      const mockTask = createMockTask({ id: taskId });
      const dependencies = [
        createMockDependency({ id: 'dep-1', taskId, dependsOnTaskId: 'task-2' }),
        createMockDependency({ id: 'dep-2', taskId, dependsOnTaskId: 'task-3' }),
      ];
      const dependents = [
        createMockDependency({ id: 'dep-3', taskId: 'task-4', dependsOnTaskId: taskId }),
      ];

      vi.mocked(mockTaskRepository.findById).mockResolvedValue(mockTask);
      vi.mocked(mockTaskDependencyRepository.findDependenciesOfTask).mockResolvedValue(
        dependencies
      );
      vi.mocked(mockTaskDependencyRepository.findDependentTasks).mockResolvedValue(dependents);

      const result = await useCase.execute(taskId);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.dependencies).toEqual(dependencies);
      expect(result.value?.dependents).toEqual(dependents);
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskDependencyRepository.findDependenciesOfTask).toHaveBeenCalledWith(taskId);
      expect(mockTaskDependencyRepository.findDependentTasks).toHaveBeenCalledWith(taskId);
    });

    it('should return empty arrays when no dependencies', async () => {
      const taskId = 'task-1';
      const mockTask = createMockTask({ id: taskId });

      vi.mocked(mockTaskRepository.findById).mockResolvedValue(mockTask);
      vi.mocked(mockTaskDependencyRepository.findDependenciesOfTask).mockResolvedValue([]);
      vi.mocked(mockTaskDependencyRepository.findDependentTasks).mockResolvedValue([]);

      const result = await useCase.execute(taskId);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.dependencies).toEqual([]);
      expect(result.value?.dependents).toEqual([]);
    });

    it('should return error when task not found', async () => {
      const taskId = 'non-existent-task';

      vi.mocked(mockTaskRepository.findById).mockResolvedValue(null);

      const result = await useCase.execute(taskId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('not found');
      expect(mockTaskDependencyRepository.findDependenciesOfTask).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const taskId = 'task-1';

      vi.mocked(mockTaskRepository.findById).mockRejectedValue(new Error('Database error'));

      const result = await useCase.execute(taskId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Database error');
    });
  });
});
