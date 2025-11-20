/**
 * Unit Tests for CheckTaskDependenciesCompleteUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CheckTaskDependenciesCompleteUseCase } from './CheckTaskDependenciesCompleteUseCase';
import { ITaskDependencyRepository } from '@/3-domain/interfaces/repositories/ITaskDependencyRepository';
import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { Result } from '@/6-core/result/Result';
import type { TaskDependency } from '@/3-domain/entities/TaskDependency';
import type { Task } from '@/3-domain/entities/Task';

describe('CheckTaskDependenciesCompleteUseCase', () => {
  let mockTaskDependencyRepository: ITaskDependencyRepository;
  let mockTaskRepository: ITaskRepository;
  let useCase: CheckTaskDependenciesCompleteUseCase;

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

    useCase = new CheckTaskDependenciesCompleteUseCase(
      mockTaskDependencyRepository,
      mockTaskRepository
    );
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
    it('should return all complete when no dependencies', async () => {
      const taskId = 'task-1';
      const mockTask = createMockTask({ id: taskId });

      vi.mocked(mockTaskRepository.findById).mockResolvedValue(mockTask);
      vi.mocked(mockTaskDependencyRepository.findDependenciesOfTask).mockResolvedValue([]);

      const result = await useCase.execute(taskId);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.allComplete).toBe(true);
      expect(result.value?.incompleteDependencies).toEqual([]);
    });

    it('should return all complete when all blocking dependencies are done', async () => {
      const taskId = 'task-1';
      const mockTask = createMockTask({ id: taskId });
      const dependencies = [
        createMockDependency({
          id: 'dep-1',
          taskId,
          dependsOnTaskId: 'task-2',
          dependencyType: 'blocks',
        }),
        createMockDependency({
          id: 'dep-2',
          taskId,
          dependsOnTaskId: 'task-3',
          dependencyType: 'blocks',
        }),
      ];
      const completedTask2 = createMockTask({ id: 'task-2', status: 'done' });
      const completedTask3 = createMockTask({ id: 'task-3', status: 'done' });

      vi.mocked(mockTaskRepository.findById)
        .mockResolvedValueOnce(mockTask)
        .mockResolvedValueOnce(completedTask2)
        .mockResolvedValueOnce(completedTask3);
      vi.mocked(mockTaskDependencyRepository.findDependenciesOfTask).mockResolvedValue(
        dependencies
      );

      const result = await useCase.execute(taskId);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.allComplete).toBe(true);
      expect(result.value?.incompleteDependencies).toEqual([]);
    });

    it('should return incomplete when some blocking dependencies are not done', async () => {
      const taskId = 'task-1';
      const mockTask = createMockTask({ id: taskId });
      const dependencies = [
        createMockDependency({
          id: 'dep-1',
          taskId,
          dependsOnTaskId: 'task-2',
          dependencyType: 'blocks',
        }),
        createMockDependency({
          id: 'dep-2',
          taskId,
          dependsOnTaskId: 'task-3',
          dependencyType: 'blocks',
        }),
      ];
      const completedTask2 = createMockTask({ id: 'task-2', status: 'done' });
      const incompleteTask3 = createMockTask({ id: 'task-3', status: 'in_progress' });

      vi.mocked(mockTaskRepository.findById)
        .mockResolvedValueOnce(mockTask)
        .mockResolvedValueOnce(completedTask2)
        .mockResolvedValueOnce(incompleteTask3);
      vi.mocked(mockTaskDependencyRepository.findDependenciesOfTask).mockResolvedValue(
        dependencies
      );

      const result = await useCase.execute(taskId);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.allComplete).toBe(false);
      expect(result.value?.incompleteDependencies).toContain('task-3');
      expect(result.value?.incompleteDependencies).not.toContain('task-2');
    });

    it('should ignore related dependencies (only check blocks)', async () => {
      const taskId = 'task-1';
      const mockTask = createMockTask({ id: taskId });
      const dependencies = [
        createMockDependency({
          id: 'dep-1',
          taskId,
          dependsOnTaskId: 'task-2',
          dependencyType: 'related', // Should be ignored
        }),
        createMockDependency({
          id: 'dep-2',
          taskId,
          dependsOnTaskId: 'task-3',
          dependencyType: 'blocks',
        }),
      ];
      const incompleteTask2 = createMockTask({ id: 'task-2', status: 'todo' });
      const completedTask3 = createMockTask({ id: 'task-3', status: 'done' });

      vi.mocked(mockTaskRepository.findById)
        .mockResolvedValueOnce(mockTask)
        .mockResolvedValueOnce(completedTask3);
      vi.mocked(mockTaskDependencyRepository.findDependenciesOfTask).mockResolvedValue(
        dependencies
      );

      const result = await useCase.execute(taskId);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.allComplete).toBe(true);
      // task-2 should not be in incompleteDependencies because it's 'related', not 'blocks'
    });

    it('should return error when task not found', async () => {
      const taskId = 'non-existent-task';

      vi.mocked(mockTaskRepository.findById).mockResolvedValue(null);

      const result = await useCase.execute(taskId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('not found');
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
