/**
 * Mark All Notifications As Read Use Case
 *
 * Marks all notifications as read for a user
 */

import { Result } from '@/6-core/result';
import { INotificationRepository } from '@/3-domain/interfaces/repositories/INotificationRepository';
import { logger } from '@/5-shared/utils/logger';

export class MarkAllNotificationsAsReadUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(userId: string): Promise<Result<number>> {
    try {
      const result = await this.notificationRepository.markAllAsRead(userId);
      if (result.isFailure) {
        return Result.fail(result.error || new Error('Failed to mark all notifications as read'));
      }

      return Result.ok(result.value);
    } catch (error) {
      logger.error('MarkAllNotificationsAsReadUseCase failed', { error, userId });
      const err =
        error instanceof Error ? error : new Error('Failed to mark all notifications as read');
      return Result.fail(err);
    }
  }
}
