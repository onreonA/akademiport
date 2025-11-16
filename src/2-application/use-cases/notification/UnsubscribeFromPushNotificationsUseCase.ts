/**
 * Unsubscribe From Push Notifications Use Case
 *
 * Unsubscribes a user from push notifications
 */

import { Result } from '@/6-core/result';
import { IPushSubscriptionRepository } from '@/3-domain/interfaces/repositories/INotificationRepository';
import { logger } from '@/5-shared/utils/logger';

export class UnsubscribeFromPushNotificationsUseCase {
  constructor(private pushSubscriptionRepository: IPushSubscriptionRepository) {}

  async execute(userId: string, endpoint?: string): Promise<Result<void>> {
    try {
      if (endpoint) {
        // Delete specific subscription
        const result = await this.pushSubscriptionRepository.deleteByEndpoint(userId, endpoint);
        if (result.isFailure) {
          return Result.fail(result.error || new Error('Failed to delete push subscription'));
        }
      } else {
        // Delete all subscriptions for user
        const result = await this.pushSubscriptionRepository.deleteByUserId(userId);
        if (result.isFailure) {
          return Result.fail(result.error || new Error('Failed to delete push subscriptions'));
        }
      }

      return Result.ok(undefined);
    } catch (error) {
      logger.error('UnsubscribeFromPushNotificationsUseCase failed', { error, userId, endpoint });
      const err =
        error instanceof Error ? error : new Error('Failed to unsubscribe from push notifications');
      return Result.fail(err);
    }
  }
}
