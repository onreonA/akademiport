import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CompleteTaskUseCase } from './CompleteTaskUseCase';
import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { Task } from '@/3-domain/entities/Task';

describe('CompleteTaskUseCase', () => {
  let mockRepository: ITaskRepository;
  let useCase: CompleteTaskUseCase;

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
    useCase = new CompleteTaskUseCase(mockRepository);
  });

  it('should complete a task successfully', async () => {
    const mockTask: Task = {
      id: 'task-1',
      subProjectId: 'subproject-1',
      assignedTo: 'user-1',
      title: 'Test Task',
      description: null,
      status: 'in_progress',
      priority: 'high',
      dueDate: null,
      completedAt: null,
      approvedAt: null,
      approvedBy: null,
      orderIndex: 1,
      deletedAt: null,
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
      assignedTo: null,
      title: 'Completed Task',
      description: null,
      status: 'done',
      priority: 'medium',
      dueDate: null,
      completedAt: new Date(),
      approvedAt: null,
      approvedBy: null,
      orderIndex: 1,
      deletedAt: null,
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
      assignedTo: null,
      title: 'Cancelled Task',
      description: null,
      status: 'cancelled',
      priority: 'low',
      dueDate: null,
      completedAt: null,
      approvedAt: null,
      approvedBy: null,
      orderIndex: 1,
      deletedAt: null,
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
