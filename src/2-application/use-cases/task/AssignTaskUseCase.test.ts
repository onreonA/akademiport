/**
 * Unit Tests for AssignTaskUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssignTaskUseCase } from './AssignTaskUseCase';
import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { NotificationService } from '@/5-shared/services/notification';
import { Task } from '@/3-domain/entities/Task';
import { AppError } from '@/6-core/errors/AppError';
import { Result } from '@/6-core/result/Result';

describe('AssignTaskUseCase', () => {
  let mockRepository: ITaskRepository;
  let mockNotificationService: NotificationService;
  let useCase: AssignTaskUseCase;

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

    mockNotificationService = {
      sendTaskAssigned: vi.fn(),
      sendTaskApproved: vi.fn(),
      sendTaskRejected: vi.fn(),
      sendTaskCompleted: vi.fn(),
      sendAppointmentConfirmed: vi.fn(),
      sendAppointmentCancelled: vi.fn(),
      sendAppointmentRescheduled: vi.fn(),
      sendEventCancelled: vi.fn(),
      sendEventUpdated: vi.fn(),
    } as any;

    useCase = new AssignTaskUseCase(mockRepository, mockNotificationService);
  });

  const createMockTask = (overrides?: Partial<Task>): Task => {
    return {
      id: 'task-1',
      subProjectId: 'subproject-1',
      assignedTo: null,
      title: 'Test Task',
      description: 'Test Description',
      status: 'todo',
      priority: 'medium',
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

  it('should assign task successfully', async () => {
    const taskId = 'task-1';
    const userId = 'user-1';
    const mockTask = createMockTask({ id: taskId });

    vi.mocked(mockRepository.exists).mockResolvedValue(true);
    vi.mocked(mockRepository.findById).mockResolvedValue(mockTask);
    vi.mocked(mockRepository.assignTo).mockResolvedValue(undefined);
    vi.mocked(mockNotificationService.sendTaskAssigned).mockResolvedValue(
      Result.ok(undefined as any)
    );

    const result = await useCase.execute(taskId, userId);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.exists).toHaveBeenCalledWith(taskId);
    expect(mockRepository.findById).toHaveBeenCalledWith(taskId);
    expect(mockRepository.assignTo).toHaveBeenCalledWith(taskId, userId);
    expect(mockNotificationService.sendTaskAssigned).toHaveBeenCalledWith(
      userId,
      taskId,
      mockTask.title,
      undefined,
      mockTask.subProjectId
    );
  });

  it('should return error when task does not exist', async () => {
    const taskId = 'non-existent';
    const userId = 'user-1';

    vi.mocked(mockRepository.exists).mockResolvedValue(false);

    const result = await useCase.execute(taskId, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Task not found');
    expect((result.error as AppError)?.statusCode).toBe(404);
    expect(mockRepository.assignTo).not.toHaveBeenCalled();
  });

  it('should return error when task not found by ID', async () => {
    const taskId = 'task-1';
    const userId = 'user-1';

    vi.mocked(mockRepository.exists).mockResolvedValue(true);
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await useCase.execute(taskId, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Task not found');
    expect((result.error as AppError)?.statusCode).toBe(404);
    expect(mockRepository.assignTo).not.toHaveBeenCalled();
  });

  it('should continue even if notification fails', async () => {
    const taskId = 'task-1';
    const userId = 'user-1';
    const mockTask = createMockTask({ id: taskId });

    vi.mocked(mockRepository.exists).mockResolvedValue(true);
    vi.mocked(mockRepository.findById).mockResolvedValue(mockTask);
    vi.mocked(mockRepository.assignTo).mockResolvedValue(undefined);
    vi.mocked(mockNotificationService.sendTaskAssigned).mockRejectedValue(
      new Error('Notification failed')
    );

    const result = await useCase.execute(taskId, userId);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.assignTo).toHaveBeenCalled();
  });

  it('should work without notification service', async () => {
    const taskId = 'task-1';
    const userId = 'user-1';
    const mockTask = createMockTask({ id: taskId });
    const useCaseWithoutNotification = new AssignTaskUseCase(mockRepository);

    vi.mocked(mockRepository.exists).mockResolvedValue(true);
    vi.mocked(mockRepository.findById).mockResolvedValue(mockTask);
    vi.mocked(mockRepository.assignTo).mockResolvedValue(undefined);

    const result = await useCaseWithoutNotification.execute(taskId, userId);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.assignTo).toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const taskId = 'task-1';
    const userId = 'user-1';
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.exists).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(taskId, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
    expect((result.error as AppError)?.statusCode).toBe(500);
  });
});
