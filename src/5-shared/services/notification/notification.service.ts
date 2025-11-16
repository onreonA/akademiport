/**
 * Notification Service
 *
 * Core notification service implementation
 */

import { Result } from '@/6-core/result';
import { Notification } from '@/3-domain/entities/Notification';
import {
  INotificationService,
  CreateNotificationOptions,
} from '@/3-domain/interfaces/services/INotificationService';
import {
  INotificationRepository,
  INotificationPreferencesRepository,
} from '@/3-domain/interfaces/repositories/INotificationRepository';
import { IEmailService } from '@/3-domain/interfaces/services/IEmailService';
import { IPushNotificationService } from '@/3-domain/interfaces/services/INotificationService';
import { CreateNotificationUseCase } from '@/2-application/use-cases/notification/CreateNotificationUseCase';
import { GetNotificationsUseCase } from '@/2-application/use-cases/notification/GetNotificationsUseCase';
import { MarkNotificationAsReadUseCase } from '@/2-application/use-cases/notification/MarkNotificationAsReadUseCase';
import { MarkAllNotificationsAsReadUseCase } from '@/2-application/use-cases/notification/MarkAllNotificationsAsReadUseCase';
import { DeleteNotificationUseCase } from '@/2-application/use-cases/notification/DeleteNotificationUseCase';
import { GetUnreadNotificationCountUseCase } from '@/2-application/use-cases/notification/GetUnreadNotificationCountUseCase';
import {
  NotificationType,
  NotificationPriority,
  NotificationChannel,
} from '@/3-domain/enums/NotificationEnums';
import { logger } from '@/5-shared/utils/logger';

export class NotificationService implements INotificationService {
  private createNotificationUseCase: CreateNotificationUseCase;
  private getNotificationsUseCase: GetNotificationsUseCase;
  private markAsReadUseCase: MarkNotificationAsReadUseCase;
  private markAllAsReadUseCase: MarkAllNotificationsAsReadUseCase;
  private deleteNotificationUseCase: DeleteNotificationUseCase;
  private getUnreadCountUseCase: GetUnreadNotificationCountUseCase;

  constructor(
    notificationRepository: INotificationRepository,
    preferencesRepository: INotificationPreferencesRepository,
    emailService?: IEmailService,
    pushNotificationService?: IPushNotificationService
  ) {
    this.createNotificationUseCase = new CreateNotificationUseCase(
      notificationRepository,
      preferencesRepository,
      emailService,
      pushNotificationService
    );
    this.getNotificationsUseCase = new GetNotificationsUseCase(notificationRepository);
    this.markAsReadUseCase = new MarkNotificationAsReadUseCase(notificationRepository);
    this.markAllAsReadUseCase = new MarkAllNotificationsAsReadUseCase(notificationRepository);
    this.deleteNotificationUseCase = new DeleteNotificationUseCase(notificationRepository);
    this.getUnreadCountUseCase = new GetUnreadNotificationCountUseCase(notificationRepository);
  }

  async createNotification(options: CreateNotificationOptions): Promise<Result<Notification>> {
    try {
      const dto = {
        userId: options.userId,
        type: options.type,
        title: options.title,
        message: options.message,
        actionUrl: options.actionUrl,
        metadata: options.metadata || {},
        priority: options.priority ?? NotificationPriority.NORMAL,
        channels: options.channels ?? [NotificationChannel.IN_APP],
        expiresAt: options.expiresAt?.toISOString(),
      };

      return await this.createNotificationUseCase.execute(dto);
    } catch (error) {
      logger.error('NotificationService.createNotification failed', { error, options });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to create notification')
      );
    }
  }

  async createNotifications(
    userIds: string[],
    options: Omit<CreateNotificationOptions, 'userId'>
  ): Promise<Result<Notification[]>> {
    try {
      const results: Notification[] = [];
      const errors: Error[] = [];

      for (const userId of userIds) {
        const result = await this.createNotification({ ...options, userId });
        if (result.isSuccess) {
          results.push(result.value);
        } else {
          errors.push(result.error || new Error('Failed to create notification'));
        }
      }

      if (errors.length > 0 && results.length === 0) {
        return Result.fail(
          new Error(`Failed to create notifications: ${errors.map((e) => e.message).join(', ')}`)
        );
      }

      return Result.ok(results);
    } catch (error) {
      logger.error('NotificationService.createNotifications failed', { error, userIds, options });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to create notifications')
      );
    }
  }

  async markAsRead(notificationId: string, userId: string): Promise<Result<Notification>> {
    return await this.markAsReadUseCase.execute(notificationId, userId);
  }

  async markAllAsRead(userId: string): Promise<Result<number>> {
    return await this.markAllAsReadUseCase.execute(userId);
  }

  async deleteNotification(notificationId: string, userId: string): Promise<Result<void>> {
    return await this.deleteNotificationUseCase.execute(notificationId, userId);
  }

  async getUserNotifications(
    userId: string,
    options?: {
      isRead?: boolean;
      type?: NotificationType;
      limit?: number;
      offset?: number;
    }
  ): Promise<Result<Notification[]>> {
    try {
      const filter = {
        userId,
        isRead: options?.isRead,
        type: options?.type,
        limit: options?.limit || 20,
        offset: options?.offset || 0,
        orderBy: 'created_at' as const,
        orderDirection: 'desc' as const,
      };

      return await this.getNotificationsUseCase.execute(filter);
    } catch (error) {
      logger.error('NotificationService.getUserNotifications failed', { error, userId, options });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to get user notifications')
      );
    }
  }

  async getUnreadCount(userId: string): Promise<Result<number>> {
    return await this.getUnreadCountUseCase.execute(userId);
  }
}
