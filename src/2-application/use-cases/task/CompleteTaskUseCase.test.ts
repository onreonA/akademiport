import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CompleteTaskUseCase } from './CompleteTaskUseCase';
import { ITaskRepository } from '@/domain/interfaces/repositories/ITaskRepository';
import { Task } from '@/domain/entities/Task';

describe('CompleteTaskUseCase', () => {
  let mockRepository: ITaskRepository;
  let useCase: CompleteTaskUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findBySubProject: vi.fn(),
      findByAssignedUser: vi.fn(),
      complete: vi.fn(),
      approve: vi.fn(),
      reject: vi.fn(),
      assign: vi.fn(),
    };
    useCase = new CompleteTaskUseCase(mockRepository);
  });

  it('should complete a task successfully', async () => {
    const mockTask: Task = {
      id: 'task-1',
      subProjectId: 'subproject-1',
      assignedTo: 'user-1',
      title: 'Test Task',
      status: 'in_progress',
      priority: 'high',
      orderIndex: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockRepository.findById).mockResolvedValue(mockTask);
    vi.mocked(mockRepository.complete).mockResolvedValue(undefined);

    const result = await useCase.execute('task-1');

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.complete).toHaveBeenCalledWith('task-1');
  });

  it('should fail if task not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await useCase.execute('nonexistent');

    expect(result.isSuccess).toBe(false);
    expect(result.error?.message).toBe('Task not found');
    expect(mockRepository.complete).not.toHaveBeenCalled();
  });

  it('should fail if task is already completed', async () => {
    const completedTask: Task = {
      id: 'task-2',
      subProjectId: 'subproject-1',
      title: 'Completed Task',
      status: 'done',
      priority: 'medium',
      orderIndex: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockRepository.findById).mockResolvedValue(completedTask);

    const result = await useCase.execute('task-2');

    expect(result.isSuccess).toBe(false);
    expect(result.error?.message).toContain('already completed');
    expect(mockRepository.complete).not.toHaveBeenCalled();
  });

  it('should fail if task is cancelled', async () => {
    const cancelledTask: Task = {
      id: 'task-3',
      subProjectId: 'subproject-1',
      title: 'Cancelled Task',
      status: 'cancelled',
      priority: 'low',
      orderIndex: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockRepository.findById).mockResolvedValue(cancelledTask);

    const result = await useCase.execute('task-3');

    expect(result.isSuccess).toBe(false);
    expect(result.error?.message).toContain('cancelled');
    expect(mockRepository.complete).not.toHaveBeenCalled();
  });
});
