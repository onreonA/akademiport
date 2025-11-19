/**
 * Push Notification Service
 *
 * Web Push API service implementation
 */

import { Result } from '@/6-core/result';
import { Notification } from '@/3-domain/entities/Notification';
import { IPushNotificationService } from '@/3-domain/interfaces/services/INotificationService';
import { IPushSubscriptionRepository } from '@/3-domain/interfaces/repositories/INotificationRepository';
import { logger } from '@/5-shared/utils/logger';

// web-push will be installed later
// For now, push notifications are disabled to avoid build errors
// TODO: Install web-push package: npm install web-push
// Then uncomment the code in sendPushNotification method

export class PushNotificationService implements IPushNotificationService {
  constructor(private pushSubscriptionRepository: IPushSubscriptionRepository) {}

  async sendPushNotification(userId: string, notification: Notification): Promise<Result<void>> {
    try {
      // web-push is not installed, skip push notifications
      logger.warn('web-push not available. Skipping push notification.');
      return Result.ok(undefined);

      // TODO: Uncomment when web-push is installed
      /*
      // Get user's push subscriptions
      const subscriptionsResult = await this.pushSubscriptionRepository.findByUserId(userId);
      if (subscriptionsResult.isFailure) {
        return Result.fail(
          subscriptionsResult.error || new Error('Failed to get push subscriptions')
        );
      }

      const subscriptions = subscriptionsResult.value;
      if (subscriptions.length === 0) {
        logger.info('No push subscriptions found for user', { userId });
        return Result.ok(undefined);
      }

      // Prepare push payload
      const payload = JSON.stringify({
        title: notification.title,
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: {
          url: notification.actionUrl || '/',
          notificationId: notification.id,
          type: notification.type,
        },
      });

      // Load web-push dynamically
      const webPushModule = await import('web-push').catch(() => null);
      if (!webPushModule) {
        logger.warn('web-push not available, skipping push notification');
        return Result.ok(undefined);
      }
      
      const webpush = webPushModule.default || webPushModule;
      
      // Send to all subscriptions
      const errors: Error[] = [];
      for (const subscription of subscriptions) {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            payload
          );
        } catch (error: any) {
          logger.error('Failed to send push notification', {
            error,
            subscriptionId: subscription.id,
          });

          // If subscription is invalid, delete it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await this.pushSubscriptionRepository.delete(subscription.id, userId);
          }

          errors.push(
            error instanceof Error ? error : new Error('Failed to send push notification')
          );
        }
      }

      if (errors.length > 0 && errors.length === subscriptions.length) {
        return Result.fail(
          new Error(`Failed to send push notifications: ${errors.map((e) => e.message).join(', ')}`)
        );
      }

      return Result.ok(undefined);
      */
    } catch (error) {
      logger.error('PushNotificationService.sendPushNotification failed', {
        error,
        userId,
        notification,
      });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to send push notification')
      );
    }
  }

  async sendPushNotifications(
    userIds: string[],
    notification: Omit<
      Notification,
      'id' | 'userId' | 'createdAt' | 'isRead' | 'emailSent' | 'pushSent'
    >
  ): Promise<Result<void>> {
    try {
      const errors: Error[] = [];

      for (const userId of userIds) {
        const fullNotification: Notification = {
          ...notification,
          id: crypto.randomUUID(),
          userId,
          createdAt: new Date(),
          isRead: false,
          emailSent: false,
          pushSent: false,
        };

        const result = await this.sendPushNotification(userId, fullNotification);
        if (result.isFailure) {
          errors.push(result.error || new Error('Failed to send push notification'));
        }
      }

      if (errors.length > 0 && errors.length === userIds.length) {
        return Result.fail(
          new Error(`Failed to send push notifications: ${errors.map((e) => e.message).join(', ')}`)
        );
      }

      return Result.ok(undefined);
    } catch (error) {
      logger.error('PushNotificationService.sendPushNotifications failed', {
        error,
        userIds,
        notification,
      });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to send push notifications')
      );
    }
  }
}
