/**
 * Push Notification Service
 *
 * Web Push API service implementation
 */

import { Result } from '@/6-core/result';
import { Notification } from '@/3-domain/entities/Notification';
import { IPushNotificationService } from '@/3-domain/interfaces/services/INotificationService';
import { IPushSubscriptionRepository } from '@/3-domain/interfaces/repositories/INotificationRepository';
import { notificationConfig } from '@/4-infrastructure/config/notification.config';
import { logger } from '@/5-shared/utils/logger';

// web-push will be installed later
// For now, we'll create a placeholder implementation
let webpush: any = null;

try {
  // Try to import web-push (will fail if not installed)
  webpush = require('web-push');
  if (notificationConfig.vapid.privateKey && notificationConfig.vapid.publicKey) {
    webpush.setVapidDetails(
      notificationConfig.vapid.subject,
      notificationConfig.vapid.publicKey,
      notificationConfig.vapid.privateKey
    );
  }
} catch (error) {
  logger.warn('web-push package not installed. Push notifications will be disabled.');
}

export class PushNotificationService implements IPushNotificationService {
  constructor(private pushSubscriptionRepository: IPushSubscriptionRepository) {}

  async sendPushNotification(userId: string, notification: Notification): Promise<Result<void>> {
    try {
      if (!webpush) {
        logger.warn('web-push not available. Skipping push notification.');
        return Result.ok(undefined);
      }

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
