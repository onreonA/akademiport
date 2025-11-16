/**
 * Mark Notification As Read Use Case Tests
 *
 * Unit tests for MarkNotificationAsReadUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MarkNotificationAsReadUseCase } from './MarkNotificationAsReadUseCase';
import { Result } from '@/6-core/result';
import { Notification } from '@/3-domain/entities/Notification';
import { NotificationType, NotificationPriority } from '@/3-domain/enums/NotificationEnums';

describe('MarkNotificationAsReadUseCase', () => {
  let useCase: MarkNotificationAsReadUseCase;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      markAsRead: vi.fn(),
    };

    useCase = new MarkNotificationAsReadUseCase(mockRepository);
  });

  const createMockNotification = (): Notification => ({
    id: 'notif-123',
    userId: 'user-123',
    type: NotificationType.INFO,
    title: 'Test Notification',
    message: 'This is a test notification',
    priority: NotificationPriority.NORMAL,
    channels: [],
    isRead: false,
    emailSent: false,
    pushSent: false,
    metadata: {},
    createdAt: new Date(),
  });

  describe('execute', () => {
    it('should mark notification as read successfully', async () => {
      const notificationId = 'notif-123';
      const userId = 'user-123';
      const mockNotification = createMockNotification();

      mockRepository.findById.mockResolvedValue(Result.ok(mockNotification));
      mockRepository.markAsRead.mockResolvedValue(
        Result.ok({ ...mockNotification, isRead: true, readAt: new Date() })
      );

      const result = await useCase.execute(notificationId, userId);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.isRead).toBe(true);
      expect(result.value?.readAt).toBeInstanceOf(Date);
      expect(mockRepository.markAsRead).toHaveBeenCalledWith(notificationId, userId);
    });

    it('should return error if notification not found', async () => {
      const notificationId = 'notif-123';
      const userId = 'user-123';

      mockRepository.findById.mockResolvedValue(Result.ok(null));

      const result = await useCase.execute(notificationId, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('not found');
    });

    it('should return error if notification belongs to different user', async () => {
      const notificationId = 'notif-123';
      const userId = 'user-123';
      const mockNotification = { ...createMockNotification(), userId: 'user-456' };

      mockRepository.findById.mockResolvedValue(Result.ok(mockNotification));

      const result = await useCase.execute(notificationId, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Unauthorized');
    });

    it('should handle repository errors', async () => {
      const notificationId = 'notif-123';
      const userId = 'user-123';
      const mockNotification = createMockNotification();

      mockRepository.findById.mockResolvedValue(Result.ok(mockNotification));
      mockRepository.markAsRead.mockResolvedValue(Result.fail(new Error('Database error')));

      const result = await useCase.execute(notificationId, userId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Database error');
    });
  });
});
