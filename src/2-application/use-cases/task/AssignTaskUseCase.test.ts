/**
 * Unit Tests for AssignTaskUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssignTaskUseCase } from './AssignTaskUseCase';
import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { NotificationService } from '@/5-shared/services/notification';
import { Task } from '@/3-domain/entities/Task';

describe('AssignTaskUseCase', () => {
  let mockRepository: ITaskRepository;
  let mockNotificationService: NotificationService;
  let useCase: AssignTaskUseCase;

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
      assignTo: vi.fn(),
      exists: vi.fn(),
    };

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
      status: 'pending',
      priority: 'normal',
      orderIndex: 1,
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
    vi.mocked(mockNotificationService.sendTaskAssigned).mockResolvedValue(undefined);

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
    expect(result.error?.statusCode).toBe(404);
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
    expect(result.error?.statusCode).toBe(404);
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
    expect(result.error?.statusCode).toBe(500);
  });
});
