import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApproveTaskUseCase } from './ApproveTaskUseCase';
import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { Task } from '@/3-domain/entities/Task';

describe('ApproveTaskUseCase', () => {
  let mockRepository: ITaskRepository;
  let useCase: ApproveTaskUseCase;

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
    useCase = new ApproveTaskUseCase(mockRepository);
  });

  it('should approve a task successfully', async () => {
    const mockTask: Task = {
      id: 'task-1',
      subProjectId: 'subproject-1',
      title: 'Test Task',
      status: 'review',
      priority: 'high',
      orderIndex: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockRepository.findById).mockResolvedValue(mockTask);
    vi.mocked(mockRepository.approve).mockResolvedValue(undefined);

    const result = await useCase.execute('task-1', 'consultant-1');

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.approve).toHaveBeenCalledWith('task-1', 'consultant-1');
  });

  it('should fail if task not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await useCase.execute('nonexistent', 'consultant-1');

    expect(result.isSuccess).toBe(false);
    expect(result.error?.message).toBe('Task not found');
    expect(mockRepository.approve).not.toHaveBeenCalled();
  });

  it('should fail if task is not in review', async () => {
    const mockTask: Task = {
      id: 'task-1',
      subProjectId: 'subproject-1',
      title: 'Test Task',
      status: 'in_progress',
      priority: 'high',
      orderIndex: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockRepository.findById).mockResolvedValue(mockTask);

    const result = await useCase.execute('task-1', 'consultant-1');

    expect(result.isSuccess).toBe(false);
    expect(result.error?.message).toContain('review');
    expect(mockRepository.approve).not.toHaveBeenCalled();
  });

  it('should fail if task is already approved', async () => {
    const approvedTask: Task = {
      id: 'task-2',
      subProjectId: 'subproject-1',
      title: 'Approved Task',
      status: 'done',
      priority: 'medium',
      approvedAt: new Date(),
      approvedBy: 'consultant-1',
      orderIndex: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockRepository.findById).mockResolvedValue(approvedTask);

    const result = await useCase.execute('task-2', 'consultant-1');

    expect(result.isSuccess).toBe(false);
    expect(result.error?.message).toContain('already approved');
    expect(mockRepository.approve).not.toHaveBeenCalled();
  });
});
