/**
 * Unit Tests for ApproveTaskUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApproveTaskUseCase } from './ApproveTaskUseCase';
import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { Task } from '@/3-domain/entities/Task';
import { NotificationService } from '@/5-shared/services/notification';
import { AppError } from '@/6-core/errors/AppError';
import { Result } from '@/6-core/result/Result';

describe('ApproveTaskUseCase', () => {
  let mockRepository: ITaskRepository;
  let mockNotificationService: NotificationService;
  let useCase: ApproveTaskUseCase;

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
      exists: vi.fn(),
      restore: vi.fn(),
    } as any;

    mockNotificationService = {
      sendTaskApproved: vi.fn(),
      sendTaskRejected: vi.fn(),
      sendTaskCompleted: vi.fn(),
      sendAppointmentCancelled: vi.fn(),
      sendEventUpdated: vi.fn(),
      sendEventCancelled: vi.fn(),
    } as any;

    useCase = new ApproveTaskUseCase(mockRepository, mockNotificationService);
  });

  const createMockTask = (overrides?: Partial<Task>): Task => {
    return {
      id: 'task-1',
      subProjectId: 'subproject-1',
      assignedTo: 'user-1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'review',
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

  it('should approve task successfully', async () => {
    const taskId = 'task-1';
    const approvedBy = 'consultant-1';
    const mockTask = createMockTask({ id: taskId, status: 'review' });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockTask);
    vi.mocked(mockRepository.approve).mockResolvedValue(undefined);
    vi.mocked(mockNotificationService.sendTaskApproved).mockResolvedValue(
      Result.ok(undefined as any)
    );

    const result = await useCase.execute(taskId, approvedBy);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.findById).toHaveBeenCalledWith(taskId);
    expect(mockRepository.approve).toHaveBeenCalledWith(taskId, approvedBy);
    expect(mockNotificationService.sendTaskApproved).toHaveBeenCalled();
  });

  it('should approve completed task', async () => {
    const taskId = 'task-1';
    const approvedBy = 'consultant-1';
    const mockTask = createMockTask({ id: taskId, status: 'done' });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockTask);
    vi.mocked(mockRepository.approve).mockResolvedValue(undefined);

    const result = await useCase.execute(taskId, approvedBy);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.approve).toHaveBeenCalled();
  });

  it('should return error when task not found', async () => {
    const taskId = 'non-existent';
    const approvedBy = 'consultant-1';

    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await useCase.execute(taskId, approvedBy);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Task not found');
    expect((result.error as AppError)?.statusCode).toBe(404);
    expect(mockRepository.approve).not.toHaveBeenCalled();
  });

  it('should return error when task is not in review or completed', async () => {
    const taskId = 'task-1';
    const approvedBy = 'consultant-1';
    const mockTask = createMockTask({ id: taskId, status: 'todo' });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockTask);

    const result = await useCase.execute(taskId, approvedBy);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('must be in review or completed');
    expect((result.error as AppError)?.statusCode).toBe(400);
    expect(mockRepository.approve).not.toHaveBeenCalled();
  });

  it('should return error when task is already approved', async () => {
    const taskId = 'task-1';
    const approvedBy = 'consultant-1';
    const mockTask = createMockTask({
      id: taskId,
      status: 'review',
      approvedAt: new Date(),
    } as any);

    vi.mocked(mockRepository.findById).mockResolvedValue(mockTask);

    const result = await useCase.execute(taskId, approvedBy);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('already approved');
    expect((result.error as AppError)?.statusCode).toBe(400);
    expect(mockRepository.approve).not.toHaveBeenCalled();
  });

  it('should continue even if notification fails', async () => {
    const taskId = 'task-1';
    const approvedBy = 'consultant-1';
    const mockTask = createMockTask({ id: taskId, status: 'review' });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockTask);
    vi.mocked(mockRepository.approve).mockResolvedValue(undefined);
    vi.mocked(mockNotificationService.sendTaskApproved).mockRejectedValue(
      new Error('Notification failed')
    );

    const result = await useCase.execute(taskId, approvedBy);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.approve).toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const taskId = 'task-1';
    const approvedBy = 'consultant-1';
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findById).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(taskId, approvedBy);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
    expect((result.error as AppError)?.statusCode).toBe(500);
  });
});
