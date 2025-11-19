/**
 * Unit Tests for DeleteNotificationUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteNotificationUseCase } from './DeleteNotificationUseCase';
import { INotificationRepository } from '@/3-domain/interfaces/repositories/INotificationRepository';
import { Notification } from '@/3-domain/entities/Notification';
import { NotificationType, NotificationPriority } from '@/3-domain/enums/NotificationEnums';
import { Result } from '@/6-core/result';

describe('DeleteNotificationUseCase', () => {
  let mockRepository: INotificationRepository;
  let useCase: DeleteNotificationUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      getUnreadCount: vi.fn(),
    };

    useCase = new DeleteNotificationUseCase(mockRepository);
  });

  const createMockNotification = (overrides?: Partial<Notification>): Notification => {
    return {
      id: 'notif-1',
      userId: 'user-1',
      type: NotificationType.INFO,
      title: 'Test Notification',
      message: 'Test Message',
      priority: NotificationPriority.NORMAL,
      channels: [],
      isRead: false,
      emailSent: false,
      pushSent: false,
      metadata: {},
      createdAt: new Date(),
      ...overrides,
    };
  };

  it('should delete notification successfully', async () => {
    const notificationId = 'notif-1';
    const userId = 'user-1';
    const mockNotification = createMockNotification({ id: notificationId, userId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockNotification));
    vi.mocked(mockRepository.delete).mockResolvedValue(Result.ok(undefined));

    const result = await useCase.execute(notificationId, userId);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.findById).toHaveBeenCalledWith(notificationId);
    expect(mockRepository.delete).toHaveBeenCalledWith(notificationId, userId);
  });

  it('should return error when notification not found', async () => {
    const notificationId = 'non-existent';
    const userId = 'user-1';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null));

    const result = await useCase.execute(notificationId, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Notification not found');
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it('should return error when repository findById fails', async () => {
    const notificationId = 'notif-1';
    const userId = 'user-1';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.fail(new Error('Database error')));

    const result = await useCase.execute(notificationId, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Database error');
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it('should return error when user tries to delete another user notification', async () => {
    const notificationId = 'notif-1';
    const userId = 'user-2';
    const ownerId = 'user-1';
    const mockNotification = createMockNotification({ id: notificationId, userId: ownerId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockNotification));

    const result = await useCase.execute(notificationId, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Unauthorized');
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it('should handle repository delete errors', async () => {
    const notificationId = 'notif-1';
    const userId = 'user-1';
    const mockNotification = createMockNotification({ id: notificationId, userId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockNotification));
    vi.mocked(mockRepository.delete).mockResolvedValue(Result.fail(new Error('Delete failed')));

    const result = await useCase.execute(notificationId, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Delete failed');
  });

  it('should handle exceptions', async () => {
    const notificationId = 'notif-1';
    const userId = 'user-1';
    const errorMessage = 'Unexpected error';

    vi.mocked(mockRepository.findById).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(notificationId, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
  });
});
