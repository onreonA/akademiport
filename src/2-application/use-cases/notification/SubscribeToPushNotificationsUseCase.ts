/**
 * Subscribe To Push Notifications Use Case
 *
 * Subscribes a user to push notifications
 */

import { Result } from '@/6-core/result';
import {
  PushSubscription,
  createPushSubscription,
  validatePushSubscription,
} from '@/3-domain/entities/PushSubscription';
import { IPushSubscriptionRepository } from '@/3-domain/interfaces/repositories/INotificationRepository';
import { PushSubscriptionDto } from '@/2-application/dtos/notification/PushSubscriptionDto';
import { logger } from '@/5-shared/utils/logger';

export class SubscribeToPushNotificationsUseCase {
  constructor(private pushSubscriptionRepository: IPushSubscriptionRepository) {}

  async execute(userId: string, dto: PushSubscriptionDto): Promise<Result<PushSubscription>> {
    try {
      // Check if subscription already exists
      const existingResult = await this.pushSubscriptionRepository.findByEndpoint(
        userId,
        dto.endpoint
      );

      if (existingResult.isSuccess && existingResult.value) {
        // Delete existing subscription and recreate
        await this.pushSubscriptionRepository.delete(existingResult.value.id, userId);
      }

      // Create new subscription
      const subscription = createPushSubscription({
        userId,
        endpoint: dto.endpoint,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        userAgent: dto.userAgent,
      });

      if (!validatePushSubscription(subscription)) {
        return Result.fail(new Error('Invalid push subscription data'));
      }

      const result = await this.pushSubscriptionRepository.create(subscription);
      if (result.isFailure) {
        return Result.fail(result.error || new Error('Failed to create push subscription'));
      }

      return Result.ok(result.value);
    } catch (error) {
      logger.error('SubscribeToPushNotificationsUseCase failed', { error, userId });
      const err =
        error instanceof Error ? error : new Error('Failed to subscribe to push notifications');
      return Result.fail(err);
    }
  }
}
