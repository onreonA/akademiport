/**
 * Unit Tests for RejectTaskUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RejectTaskUseCase } from './RejectTaskUseCase';
import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { Task } from '@/3-domain/entities/Task';
import { NotificationService } from '@/5-shared/services/notification';

describe('RejectTaskUseCase', () => {
  let mockRepository: ITaskRepository;
  let mockNotificationService: NotificationService;
  let useCase: RejectTaskUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findBySubProject: vi.fn(),
      findByAssignedUser: vi.fn(),
      findBySubProjectId: vi.fn(),
      complete: vi.fn(),
      approve: vi.fn(),
      reject: vi.fn(),
      assign: vi.fn(),
      exists: vi.fn(),
    };

    mockNotificationService = {
      sendTaskApproved: vi.fn(),
      sendTaskRejected: vi.fn(),
      sendTaskCompleted: vi.fn(),
      sendAppointmentCancelled: vi.fn(),
      sendEventUpdated: vi.fn(),
      sendEventCancelled: vi.fn(),
    } as any;

    useCase = new RejectTaskUseCase(mockRepository, mockNotificationService);
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
      orderIndex: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  it('should reject task successfully', async () => {
    const taskId = 'task-1';
    const reason = 'Needs improvement';
    const mockTask = createMockTask({ id: taskId, status: 'review' });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockTask);
    vi.mocked(mockRepository.reject).mockResolvedValue(undefined);
    vi.mocked(mockNotificationService.sendTaskRejected).mockResolvedValue(undefined);

    const result = await useCase.execute(taskId, reason);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.findById).toHaveBeenCalledWith(taskId);
    expect(mockRepository.reject).toHaveBeenCalledWith(taskId);
    expect(mockNotificationService.sendTaskRejected).toHaveBeenCalled();
  });

  it('should reject task without reason', async () => {
    const taskId = 'task-1';
    const mockTask = createMockTask({ id: taskId, status: 'review' });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockTask);
    vi.mocked(mockRepository.reject).mockResolvedValue(undefined);
    vi.mocked(mockNotificationService.sendTaskRejected).mockResolvedValue(undefined);

    const result = await useCase.execute(taskId);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.reject).toHaveBeenCalled();
  });

  it('should return error when task not found', async () => {
    const taskId = 'non-existent';

    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await useCase.execute(taskId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Task not found');
    expect(result.error?.statusCode).toBe(404);
    expect(mockRepository.reject).not.toHaveBeenCalled();
  });

  it('should return error when task is not in review', async () => {
    const taskId = 'task-1';
    const mockTask = createMockTask({ id: taskId, status: 'todo' });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockTask);

    const result = await useCase.execute(taskId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('must be in review');
    expect(result.error?.statusCode).toBe(400);
    expect(mockRepository.reject).not.toHaveBeenCalled();
  });

  it('should continue even if notification fails', async () => {
    const taskId = 'task-1';
    const mockTask = createMockTask({ id: taskId, status: 'review' });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockTask);
    vi.mocked(mockRepository.reject).mockResolvedValue(undefined);
    vi.mocked(mockNotificationService.sendTaskRejected).mockRejectedValue(
      new Error('Notification failed')
    );

    const result = await useCase.execute(taskId);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.reject).toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const taskId = 'task-1';
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findById).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(taskId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
    expect(result.error?.statusCode).toBe(500);
  });
});
