/**
 * Get Notifications Use Case Tests
 *
 * Unit tests for GetNotificationsUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetNotificationsUseCase } from './GetNotificationsUseCase';
import { NotificationFilterDto } from '@/2-application/dtos/notification/NotificationFilterDto';
import { NotificationType, NotificationPriority } from '@/3-domain/enums/NotificationEnums';
import { Result } from '@/6-core/result';
import { Notification } from '@/3-domain/entities/Notification';

describe('GetNotificationsUseCase', () => {
  let useCase: GetNotificationsUseCase;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findMany: vi.fn(),
    };

    useCase = new GetNotificationsUseCase(mockRepository);
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
    it('should get notifications successfully', async () => {
      const filter: NotificationFilterDto = {
        userId: 'user-123',
        limit: 20,
        offset: 0,
        orderBy: 'created_at',
        orderDirection: 'desc',
      };

      const mockNotifications = [createMockNotification(), createMockNotification()];
      mockRepository.findMany.mockResolvedValue(Result.ok(mockNotifications));

      const result = await useCase.execute(filter);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockNotifications);
      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          limit: 20,
          offset: 0,
        })
      );
    });

    it('should filter by isRead status', async () => {
      const filter: NotificationFilterDto = {
        userId: 'user-123',
        isRead: true,
        limit: 20,
        offset: 0,
        orderBy: 'created_at',
        orderDirection: 'desc',
      };

      const mockNotifications = [createMockNotification()];
      mockRepository.findMany.mockResolvedValue(Result.ok(mockNotifications));

      const result = await useCase.execute(filter);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          isRead: true,
        })
      );
    });

    it('should filter by type', async () => {
      const filter: NotificationFilterDto = {
        userId: 'user-123',
        type: NotificationType.TASK_ASSIGNED,
        limit: 20,
        offset: 0,
        orderBy: 'created_at',
        orderDirection: 'desc',
      };

      const mockNotifications = [createMockNotification()];
      mockRepository.findMany.mockResolvedValue(Result.ok(mockNotifications));

      const result = await useCase.execute(filter);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.TASK_ASSIGNED,
        })
      );
    });

    it('should handle repository errors', async () => {
      const filter: NotificationFilterDto = {
        userId: 'user-123',
        limit: 20,
        offset: 0,
        orderBy: 'created_at',
        orderDirection: 'desc',
      };

      mockRepository.findMany.mockResolvedValue(Result.fail(new Error('Database error')));

      const result = await useCase.execute(filter);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Database error');
    });
  });
});
