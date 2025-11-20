/**
 * Unit Tests for ValidateTaskDependencyUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ValidateTaskDependencyUseCase } from './ValidateTaskDependencyUseCase';
import { ITaskDependencyRepository } from '@/3-domain/interfaces/repositories/ITaskDependencyRepository';
import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { Result } from '@/6-core/result/Result';
import type { Task } from '@/3-domain/entities/Task';

describe('ValidateTaskDependencyUseCase', () => {
  let mockTaskDependencyRepository: ITaskDependencyRepository;
  let mockTaskRepository: ITaskRepository;
  let useCase: ValidateTaskDependencyUseCase;

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

    useCase = new ValidateTaskDependencyUseCase(mockTaskDependencyRepository, mockTaskRepository);
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

  describe('execute', () => {
    it('should validate dependency successfully', async () => {
      const taskId = 'task-1';
      const dependsOnTaskId = 'task-2';
      const task1 = createMockTask({ id: taskId });
      const task2 = createMockTask({ id: dependsOnTaskId });

      vi.mocked(mockTaskRepository.findById)
        .mockResolvedValueOnce(task1)
        .mockResolvedValueOnce(task2);
      vi.mocked(mockTaskDependencyRepository.exists).mockResolvedValue(false);
      vi.mocked(mockTaskDependencyRepository.checkCircularDependency).mockResolvedValue(false);

      const result = await useCase.execute(taskId, dependsOnTaskId);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.isValid).toBe(true);
      expect(result.value?.message).toBe('Dependency is valid');
    });

    it('should return invalid when task not found', async () => {
      const taskId = 'non-existent-task';
      const dependsOnTaskId = 'task-2';

      vi.mocked(mockTaskRepository.findById).mockResolvedValue(null);

      const result = await useCase.execute(taskId, dependsOnTaskId);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.isValid).toBe(false);
      expect(result.value?.message).toBe('Task not found');
    });

    it('should return invalid when depends on task not found', async () => {
      const taskId = 'task-1';
      const dependsOnTaskId = 'non-existent-task';
      const task1 = createMockTask({ id: taskId });

      vi.mocked(mockTaskRepository.findById)
        .mockResolvedValueOnce(task1)
        .mockResolvedValueOnce(null);

      const result = await useCase.execute(taskId, dependsOnTaskId);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.isValid).toBe(false);
      expect(result.value?.message).toBe('Depends on task not found');
    });

    it('should return invalid for self-dependency', async () => {
      const taskId = 'task-1';
      const task1 = createMockTask({ id: taskId });

      vi.mocked(mockTaskRepository.findById).mockResolvedValue(task1);

      const result = await useCase.execute(taskId, taskId);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.isValid).toBe(false);
      expect(result.value?.message).toBe('Task cannot depend on itself');
    });

    it('should return invalid when dependency already exists', async () => {
      const taskId = 'task-1';
      const dependsOnTaskId = 'task-2';
      const task1 = createMockTask({ id: taskId });
      const task2 = createMockTask({ id: dependsOnTaskId });

      vi.mocked(mockTaskRepository.findById)
        .mockResolvedValueOnce(task1)
        .mockResolvedValueOnce(task2);
      vi.mocked(mockTaskDependencyRepository.exists).mockResolvedValue(true);

      const result = await useCase.execute(taskId, dependsOnTaskId);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.isValid).toBe(false);
      expect(result.value?.message).toBe('This dependency already exists');
    });

    it('should return invalid when circular dependency detected', async () => {
      const taskId = 'task-1';
      const dependsOnTaskId = 'task-2';
      const task1 = createMockTask({ id: taskId });
      const task2 = createMockTask({ id: dependsOnTaskId });

      vi.mocked(mockTaskRepository.findById)
        .mockResolvedValueOnce(task1)
        .mockResolvedValueOnce(task2);
      vi.mocked(mockTaskDependencyRepository.exists).mockResolvedValue(false);
      vi.mocked(mockTaskDependencyRepository.checkCircularDependency).mockResolvedValue(true);

      const result = await useCase.execute(taskId, dependsOnTaskId);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.isValid).toBe(false);
      expect(result.value?.message).toContain('Circular dependency');
    });

    it('should handle errors gracefully', async () => {
      const taskId = 'task-1';
      const dependsOnTaskId = 'task-2';

      vi.mocked(mockTaskRepository.findById).mockRejectedValue(new Error('Database error'));

      const result = await useCase.execute(taskId, dependsOnTaskId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Database error');
    });
  });
});
