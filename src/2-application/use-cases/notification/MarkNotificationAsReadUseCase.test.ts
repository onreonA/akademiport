/**
 * Unit Tests for MarkNotificationAsReadUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MarkNotificationAsReadUseCase } from './MarkNotificationAsReadUseCase';
import { INotificationRepository } from '@/3-domain/interfaces/repositories/INotificationRepository';
import { Notification } from '@/3-domain/entities/Notification';
import { NotificationType, NotificationPriority } from '@/3-domain/enums/NotificationEnums';
import { Result } from '@/6-core/result';

describe('MarkNotificationAsReadUseCase', () => {
  let mockRepository: INotificationRepository;
  let useCase: MarkNotificationAsReadUseCase;

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

    useCase = new MarkNotificationAsReadUseCase(mockRepository);
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

  it('should mark notification as read successfully', async () => {
    const notificationId = 'notif-1';
    const userId = 'user-1';
    const mockNotification = createMockNotification({ id: notificationId, userId, isRead: false });
    const updatedNotification = createMockNotification({
      id: notificationId,
      userId,
      isRead: true,
    });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockNotification));
    vi.mocked(mockRepository.markAsRead).mockResolvedValue(Result.ok(updatedNotification));

    const result = await useCase.execute(notificationId, userId);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(updatedNotification);
    expect(mockRepository.findById).toHaveBeenCalledWith(notificationId);
    expect(mockRepository.markAsRead).toHaveBeenCalledWith(notificationId, userId);
  });

  it('should return notification if already read', async () => {
    const notificationId = 'notif-1';
    const userId = 'user-1';
    const mockNotification = createMockNotification({ id: notificationId, userId, isRead: true });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockNotification));

    const result = await useCase.execute(notificationId, userId);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockNotification);
    expect(mockRepository.markAsRead).not.toHaveBeenCalled();
  });

  it('should return error when notification not found', async () => {
    const notificationId = 'non-existent';
    const userId = 'user-1';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null));

    const result = await useCase.execute(notificationId, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Notification not found');
    expect(mockRepository.markAsRead).not.toHaveBeenCalled();
  });

  it('should return error when repository findById fails', async () => {
    const notificationId = 'notif-1';
    const userId = 'user-1';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.fail(new Error('Database error')));

    const result = await useCase.execute(notificationId, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Database error');
    expect(mockRepository.markAsRead).not.toHaveBeenCalled();
  });

  it('should return error when user tries to mark another user notification', async () => {
    const notificationId = 'notif-1';
    const userId = 'user-2';
    const ownerId = 'user-1';
    const mockNotification = createMockNotification({ id: notificationId, userId: ownerId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockNotification));

    const result = await useCase.execute(notificationId, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Unauthorized');
    expect(mockRepository.markAsRead).not.toHaveBeenCalled();
  });

  it('should handle repository markAsRead errors', async () => {
    const notificationId = 'notif-1';
    const userId = 'user-1';
    const mockNotification = createMockNotification({ id: notificationId, userId, isRead: false });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockNotification));
    vi.mocked(mockRepository.markAsRead).mockResolvedValue(Result.fail(new Error('Mark failed')));

    const result = await useCase.execute(notificationId, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Mark failed');
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
