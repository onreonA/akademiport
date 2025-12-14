/**
 * Notification Broadcaster
 *
 * Server-side notification broadcasting service
 * Handles broadcasting notifications to multiple users efficiently
 */

import { Result } from '@/6-core/result/Result';
import { Notification } from '@/3-domain/entities/Notification';
import { INotificationRepository } from '@/3-domain/interfaces/repositories/INotificationRepository';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import { IUserRepository } from '@/3-domain/interfaces/IUserRepository';
import {
  NotificationType,
  NotificationPriority,
  NotificationChannel,
} from '@/3-domain/enums/NotificationEnums';
import { logger } from '@/5-shared/utils/logger';
import { cacheManager, cacheKeys } from '@/5-shared/cache/cache-manager';

export interface BroadcastNotificationOptions {
  userIds: string[];
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  expiresAt?: Date;
}

export interface BatchNotificationOptions {
  notifications: Array<{
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    actionUrl?: string;
    metadata?: Record<string, any>;
    priority?: NotificationPriority;
    channels?: NotificationChannel[];
    expiresAt?: Date;
  }>;
}

export class NotificationBroadcaster {
  constructor(
    private notificationRepository: INotificationRepository,
    private companyRepository?: ICompanyRepository,
    private userRepository?: IUserRepository,
    private pushNotificationService?: IPushNotificationService
  ) {}

  /**
   * Broadcast notification to multiple users
   * Uses batch insert for efficiency
   */
  async broadcast(
    options: BroadcastNotificationOptions
  ): Promise<Result<{ success: number; failed: number; notifications: Notification[] }>> {
    try {
      const {
        userIds,
        type,
        title,
        message,
        actionUrl,
        metadata = {},
        priority = NotificationPriority.NORMAL,
        channels = [NotificationChannel.IN_APP],
        expiresAt,
      } = options;

      if (userIds.length === 0) {
        return Result.ok({ success: 0, failed: 0, notifications: [] });
      }

      // Create notification entities
      const notifications: Notification[] = userIds.map((userId) => ({
        id: crypto.randomUUID(),
        userId,
        type,
        title,
        message,
        actionUrl,
        metadata,
        priority,
        channels,
        isRead: false,
        readAt: undefined,
        emailSent: false,
        pushSent: false,
        createdAt: new Date(),
        expiresAt,
      }));

      // Batch insert notifications
      const result = await this.notificationRepository.createMany(notifications);

      if (result.isFailure) {
        logger.error('Failed to broadcast notifications', {
          error: result.error,
          userIds: userIds.length,
        });
        return Result.fail(result.error || new Error('Failed to broadcast notifications'));
      }

      // Invalidate notification cache for affected users
      await this.invalidateNotificationCache(userIds);

      // Send push notifications if enabled
      if (this.pushNotificationService && channels.includes(NotificationChannel.PUSH)) {
        const pushResult = await this.sendPushNotifications(result.value, userIds);
        if (pushResult.isFailure) {
          logger.warn('Failed to send push notifications', {
            error: pushResult.error,
            count: notifications.length,
          });
          // Don't fail the entire operation if push fails
        }
      }

      logger.info('Notifications broadcasted', {
        count: notifications.length,
        type,
        priority,
        channels,
      });

      return Result.ok({
        success: notifications.length,
        failed: 0,
        notifications: result.value,
      });
    } catch (error) {
      logger.error('NotificationBroadcaster.broadcast failed', { error, options });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to broadcast notifications')
      );
    }
  }

  /**
   * Send batch notifications (different content per user)
   */
  async broadcastBatch(
    options: BatchNotificationOptions
  ): Promise<Result<{ success: number; failed: number; notifications: Notification[] }>> {
    try {
      const { notifications: notificationData } = options;

      if (notificationData.length === 0) {
        return Result.ok({ success: 0, failed: 0, notifications: [] });
      }

      // Create notification entities
      const notifications: Notification[] = notificationData.map((data) => ({
        id: crypto.randomUUID(),
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl,
        metadata: data.metadata || {},
        priority: data.priority || NotificationPriority.NORMAL,
        channels: data.channels || [NotificationChannel.IN_APP],
        isRead: false,
        readAt: undefined,
        emailSent: false,
        pushSent: false,
        createdAt: new Date(),
        expiresAt: data.expiresAt,
      }));

      // Batch insert notifications
      const result = await this.notificationRepository.createMany(notifications);

      if (result.isFailure) {
        logger.error('Failed to broadcast batch notifications', {
          error: result.error,
          count: notifications.length,
        });
        return Result.fail(result.error || new Error('Failed to broadcast batch notifications'));
      }

      // Invalidate notification cache for affected users
      const userIds = [...new Set(notificationData.map((n) => n.userId))];
      await this.invalidateNotificationCache(userIds);

      // Send push notifications if enabled
      if (this.pushNotificationService) {
        const pushEnabledNotifications = result.value.filter((n) =>
          n.channels.includes(NotificationChannel.PUSH)
        );
        if (pushEnabledNotifications.length > 0) {
          const pushUserIds = [...new Set(pushEnabledNotifications.map((n) => n.userId))];
          const pushResult = await this.sendPushNotifications(
            pushEnabledNotifications,
            pushUserIds
          );
          if (pushResult.isFailure) {
            logger.warn('Failed to send push notifications', {
              error: pushResult.error,
              count: pushEnabledNotifications.length,
            });
            // Don't fail the entire operation if push fails
          }
        }
      }

      logger.info('Batch notifications broadcasted', {
        count: notifications.length,
      });

      return Result.ok({
        success: notifications.length,
        failed: 0,
        notifications: result.value,
      });
    } catch (error) {
      logger.error('NotificationBroadcaster.broadcastBatch failed', { error, options });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to broadcast batch notifications')
      );
    }
  }

  /**
   * Broadcast notification to users in a company
   */
  async broadcastToCompany(
    companyId: string,
    options: Omit<BroadcastNotificationOptions, 'userIds'>
  ): Promise<Result<{ success: number; failed: number; notifications: Notification[] }>> {
    try {
      if (!this.userRepository) {
        return Result.fail(new Error('UserRepository not provided'));
      }

      // Get company users
      const usersResult = await this.userRepository.findWithFilters({
        companyId,
        isActive: true,
        limit: 1000, // Get all active users
      });

      if (usersResult.isFailure) {
        return Result.fail(usersResult.error || new Error('Failed to fetch company users'));
      }

      const userIds = usersResult.value.users.map((user) => user.id);

      if (userIds.length === 0) {
        return Result.ok({ success: 0, failed: 0, notifications: [] });
      }

      return this.broadcast({
        ...options,
        userIds,
      });
    } catch (error) {
      logger.error('NotificationBroadcaster.broadcastToCompany failed', { error, companyId });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to broadcast to company')
      );
    }
  }

  /**
   * Broadcast notification to users in a program
   */
  async broadcastToProgram(
    programId: string,
    options: Omit<BroadcastNotificationOptions, 'userIds'>
  ): Promise<Result<{ success: number; failed: number; notifications: Notification[] }>> {
    try {
      if (!this.userRepository) {
        return Result.fail(new Error('UserRepository not provided'));
      }

      // Get program users
      const usersResult = await this.userRepository.findWithFilters({
        programId,
        isActive: true,
        limit: 1000, // Get all active users
      });

      if (usersResult.isFailure) {
        return Result.fail(usersResult.error || new Error('Failed to fetch program users'));
      }

      const userIds = usersResult.value.users.map((user) => user.id);

      if (userIds.length === 0) {
        return Result.ok({ success: 0, failed: 0, notifications: [] });
      }

      return this.broadcast({
        ...options,
        userIds,
      });
    } catch (error) {
      logger.error('NotificationBroadcaster.broadcastToProgram failed', { error, programId });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to broadcast to program')
      );
    }
  }

  /**
   * Send push notifications to users
   */
  private async sendPushNotifications(
    notifications: Notification[],
    userIds: string[]
  ): Promise<Result<void>> {
    if (!this.pushNotificationService) {
      return Result.ok(undefined);
    }

    try {
      // Group notifications by user
      const notificationsByUser = new Map<string, Notification[]>();
      for (const notification of notifications) {
        if (!notificationsByUser.has(notification.userId)) {
          notificationsByUser.set(notification.userId, []);
        }
        notificationsByUser.get(notification.userId)!.push(notification);
      }

      // Send push notifications for each user
      const errors: Error[] = [];
      for (const userId of userIds) {
        const userNotifications = notificationsByUser.get(userId) || [];
        for (const notification of userNotifications) {
          if (notification.channels.includes(NotificationChannel.PUSH)) {
            const result = await this.pushNotificationService.sendPushNotification(
              userId,
              notification
            );
            if (result.isFailure) {
              errors.push(result.error || new Error('Failed to send push notification'));
            }
          }
        }
      }

      if (errors.length > 0 && errors.length === notifications.length) {
        return Result.fail(
          new Error(`Failed to send push notifications: ${errors.map((e) => e.message).join(', ')}`)
        );
      }

      return Result.ok(undefined);
    } catch (error) {
      logger.error('Failed to send push notifications', { error });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to send push notifications')
      );
    }
  }

  /**
   * Invalidate notification cache for users
   */
  private async invalidateNotificationCache(userIds: string[]): Promise<void> {
    try {
      // Invalidate cache for each user
      const cacheKeysToDelete = userIds.map((userId) => `notifications:${userId}:*`);
      await Promise.all(cacheKeysToDelete.map((pattern) => cacheManager.deletePattern(pattern)));
    } catch (error) {
      logger.warn('Failed to invalidate notification cache', { error });
      // Don't fail the operation if cache invalidation fails
    }
  }
}
