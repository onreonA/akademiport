/**
 * Get Unread Notification Count Use Case
 *
 * Gets the count of unread notifications for a user
 */

import { Result } from '@/6-core/result';
import { INotificationRepository } from '@/3-domain/interfaces/repositories/INotificationRepository';
import { logger } from '@/5-shared/utils/logger';

export class GetUnreadNotificationCountUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(userId: string): Promise<Result<number>> {
    try {
      const result = await this.notificationRepository.getUnreadCount(userId);
      if (result.isFailure) {
        return Result.fail(result.error || new Error('Failed to get unread count'));
      }

      return Result.ok(result.value);
    } catch (error) {
      logger.error('GetUnreadNotificationCountUseCase failed', { error, userId });
      const err =
        error instanceof Error ? error : new Error('Failed to get unread notification count');
      return Result.fail(err);
    }
  }
}
