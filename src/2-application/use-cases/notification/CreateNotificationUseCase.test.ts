/**
 * Create Notification Use Case Tests
 *
 * Unit tests for CreateNotificationUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateNotificationUseCase } from './CreateNotificationUseCase';
import { CreateNotificationDto } from '@/2-application/dtos/notification/CreateNotificationDto';
import {
  NotificationType,
  NotificationPriority,
  NotificationChannel,
} from '@/3-domain/enums/NotificationEnums';
import { Result } from '@/6-core/result';
import { Notification } from '@/3-domain/entities/Notification';

describe('CreateNotificationUseCase', () => {
  let useCase: CreateNotificationUseCase;
  let mockNotificationRepository: any;
  let mockPreferencesRepository: any;
  let mockEmailService: any;
  let mockPushNotificationService: any;

  beforeEach(() => {
    mockNotificationRepository = {
      create: vi.fn(),
      update: vi.fn(),
    };

    mockPreferencesRepository = {
      findByUserId: vi.fn(),
      create: vi.fn(),
    };

    mockEmailService = {
      send: vi.fn(),
    };

    mockPushNotificationService = {
      sendPushNotification: vi.fn(),
    };

    useCase = new CreateNotificationUseCase(
      mockNotificationRepository,
      mockPreferencesRepository,
      mockEmailService,
      mockPushNotificationService
    );
  });

  const createValidDto = (): CreateNotificationDto => ({
    userId: 'user-123',
    type: NotificationType.INFO,
    title: 'Test Notification',
    message: 'This is a test notification',
    priority: NotificationPriority.NORMAL,
    channels: [NotificationChannel.IN_APP],
    metadata: {},
  });

  describe('execute', () => {
    it('should create notification successfully', async () => {
      const dto = createValidDto();
      const mockNotification: Notification = {
        id: 'notif-123',
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        priority: dto.priority!,
        channels: dto.channels!,
        isRead: false,
        emailSent: false,
        pushSent: false,
        metadata: {},
        createdAt: new Date(),
      };

      mockPreferencesRepository.findByUserId.mockResolvedValue(Result.ok(null));
      mockPreferencesRepository.create.mockResolvedValue(
        Result.ok({
          id: 'pref-123',
          userId: dto.userId,
          emailEnabled: true,
          pushEnabled: true,
          inAppEnabled: true,
          quietHoursEnabled: false,
          typePreferences: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      );
      mockNotificationRepository.create.mockResolvedValue(Result.ok(mockNotification));

      const result = await useCase.execute(dto);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockNotification);
      expect(mockNotificationRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should send email if email channel is enabled', async () => {
      const dto = createValidDto();
      dto.channels = [NotificationChannel.EMAIL, NotificationChannel.IN_APP];

      const mockNotification: Notification = {
        id: 'notif-123',
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        priority: dto.priority!,
        channels: dto.channels!,
        isRead: false,
        emailSent: false,
        pushSent: false,
        metadata: {},
        createdAt: new Date(),
      };

      mockPreferencesRepository.findByUserId.mockResolvedValue(
        Result.ok({
          id: 'pref-123',
          userId: dto.userId,
          emailEnabled: true,
          pushEnabled: true,
          inAppEnabled: true,
          quietHoursEnabled: false,
          typePreferences: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      );
      mockNotificationRepository.create.mockResolvedValue(Result.ok(mockNotification));
      mockEmailService.send.mockResolvedValue(Result.ok({ success: true }));
      mockNotificationRepository.update.mockResolvedValue(
        Result.ok({ ...mockNotification, emailSent: true })
      );

      const result = await useCase.execute(dto);

      expect(result.isSuccess).toBe(true);
      expect(mockEmailService.send).toHaveBeenCalledTimes(1);
    });

    it('should send push notification if push channel is enabled', async () => {
      const dto = createValidDto();
      dto.channels = [NotificationChannel.PUSH, NotificationChannel.IN_APP];

      const mockNotification: Notification = {
        id: 'notif-123',
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        priority: dto.priority!,
        channels: dto.channels!,
        isRead: false,
        emailSent: false,
        pushSent: false,
        metadata: {},
        createdAt: new Date(),
      };

      mockPreferencesRepository.findByUserId.mockResolvedValue(
        Result.ok({
          id: 'pref-123',
          userId: dto.userId,
          emailEnabled: true,
          pushEnabled: true,
          inAppEnabled: true,
          quietHoursEnabled: false,
          typePreferences: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      );
      mockNotificationRepository.create.mockResolvedValue(Result.ok(mockNotification));
      mockPushNotificationService.sendPushNotification.mockResolvedValue(Result.ok(undefined));
      mockNotificationRepository.update.mockResolvedValue(
        Result.ok({ ...mockNotification, pushSent: true })
      );

      const result = await useCase.execute(dto);

      expect(result.isSuccess).toBe(true);
      expect(mockPushNotificationService.sendPushNotification).toHaveBeenCalledTimes(1);
    });

    it('should handle repository errors', async () => {
      const dto = createValidDto();
      mockPreferencesRepository.findByUserId.mockResolvedValue(Result.ok(null));
      mockPreferencesRepository.create.mockResolvedValue(
        Result.ok({
          id: 'pref-123',
          userId: dto.userId,
          emailEnabled: true,
          pushEnabled: true,
          inAppEnabled: true,
          quietHoursEnabled: false,
          typePreferences: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      );
      mockNotificationRepository.create.mockResolvedValue(Result.fail(new Error('Database error')));

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Database error');
    });
  });
});
