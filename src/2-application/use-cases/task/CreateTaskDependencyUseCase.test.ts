/**
 * Unit Tests for CreateTaskDependencyUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateTaskDependencyUseCase } from './CreateTaskDependencyUseCase';
import { ITaskDependencyRepository } from '@/3-domain/interfaces/repositories/ITaskDependencyRepository';
import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { Result } from '@/6-core/result/Result';
import type { TaskDependency } from '@/3-domain/entities/TaskDependency';
import type { Task } from '@/3-domain/entities/Task';
import { CreateTaskDependencyDto } from '@/3-domain/entities/TaskDependency';

describe('CreateTaskDependencyUseCase', () => {
  let mockTaskDependencyRepository: ITaskDependencyRepository;
  let mockTaskRepository: ITaskRepository;
  let useCase: CreateTaskDependencyUseCase;

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

    useCase = new CreateTaskDependencyUseCase(mockTaskDependencyRepository, mockTaskRepository);
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

  const createValidDto = (
    overrides?: Partial<CreateTaskDependencyDto>
  ): CreateTaskDependencyDto => {
    return {
      taskId: 'task-1',
      dependsOnTaskId: 'task-2',
      dependencyType: 'blocks',
      ...overrides,
    };
  };

  describe('execute', () => {
    it('should create dependency successfully', async () => {
      const dto = createValidDto();
      const task1 = createMockTask({ id: 'task-1' });
      const task2 = createMockTask({ id: 'task-2' });
      const createdDependency = createMockDependency();

      vi.mocked(mockTaskRepository.findById)
        .mockResolvedValueOnce(task1)
        .mockResolvedValueOnce(task2);
      vi.mocked(mockTaskDependencyRepository.exists).mockResolvedValue(false);
      vi.mocked(mockTaskDependencyRepository.checkCircularDependency).mockResolvedValue(false);
      vi.mocked(mockTaskDependencyRepository.create).mockResolvedValue(createdDependency);

      const result = await useCase.execute(dto);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeInstanceOf(Object);
      expect(mockTaskRepository.findById).toHaveBeenCalledTimes(2);
      expect(mockTaskDependencyRepository.exists).toHaveBeenCalledWith('task-1', 'task-2');
      expect(mockTaskDependencyRepository.checkCircularDependency).toHaveBeenCalledWith(
        'task-1',
        'task-2'
      );
      expect(mockTaskDependencyRepository.create).toHaveBeenCalledWith(dto);
    });

    it('should return error when validation fails (self-dependency)', async () => {
      const dto = createValidDto({ taskId: 'task-1', dependsOnTaskId: 'task-1' });

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('cannot depend on itself');
      expect(mockTaskDependencyRepository.create).not.toHaveBeenCalled();
    });

    it('should return error when task not found', async () => {
      const dto = createValidDto();

      vi.mocked(mockTaskRepository.findById).mockResolvedValue(null);

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('not found');
      expect(mockTaskDependencyRepository.create).not.toHaveBeenCalled();
    });

    it('should return error when depends on task not found', async () => {
      const dto = createValidDto();
      const task1 = createMockTask({ id: 'task-1' });

      vi.mocked(mockTaskRepository.findById)
        .mockResolvedValueOnce(task1)
        .mockResolvedValueOnce(null);

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Depends on task not found');
      expect(mockTaskDependencyRepository.create).not.toHaveBeenCalled();
    });

    it('should return error when dependency already exists', async () => {
      const dto = createValidDto();
      const task1 = createMockTask({ id: 'task-1' });
      const task2 = createMockTask({ id: 'task-2' });

      vi.mocked(mockTaskRepository.findById)
        .mockResolvedValueOnce(task1)
        .mockResolvedValueOnce(task2);
      vi.mocked(mockTaskDependencyRepository.exists).mockResolvedValue(true);

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('already exists');
      expect(mockTaskDependencyRepository.create).not.toHaveBeenCalled();
    });

    it('should return error when circular dependency detected', async () => {
      const dto = createValidDto();
      const task1 = createMockTask({ id: 'task-1' });
      const task2 = createMockTask({ id: 'task-2' });

      vi.mocked(mockTaskRepository.findById)
        .mockResolvedValueOnce(task1)
        .mockResolvedValueOnce(task2);
      vi.mocked(mockTaskDependencyRepository.exists).mockResolvedValue(false);
      vi.mocked(mockTaskDependencyRepository.checkCircularDependency).mockResolvedValue(true);

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Circular dependency');
      expect(mockTaskDependencyRepository.create).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const dto = createValidDto();

      vi.mocked(mockTaskRepository.findById).mockRejectedValue(new Error('Database error'));

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Database error');
    });
  });
});
