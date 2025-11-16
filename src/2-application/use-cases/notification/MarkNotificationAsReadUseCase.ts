/**
 * Mark Notification As Read Use Case
 *
 * Marks a notification as read
 */

import { Result } from '@/6-core/result';
import { Notification } from '@/3-domain/entities/Notification';
import { INotificationRepository } from '@/3-domain/interfaces/repositories/INotificationRepository';
import { logger } from '@/5-shared/utils/logger';

export class MarkNotificationAsReadUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(notificationId: string, userId: string): Promise<Result<Notification>> {
    try {
      // Verify notification belongs to user
      const findResult = await this.notificationRepository.findById(notificationId);
      if (findResult.isFailure) {
        return Result.fail(findResult.error || new Error('Failed to find notification'));
      }

      const notification = findResult.value;
      if (!notification) {
        return Result.fail(new Error('Notification not found'));
      }

      if (notification.userId !== userId) {
        return Result.fail(new Error('Unauthorized'));
      }

      if (notification.isRead) {
        return Result.ok(notification);
      }

      const result = await this.notificationRepository.markAsRead(notificationId, userId);
      if (result.isFailure) {
        return Result.fail(result.error || new Error('Failed to mark notification as read'));
      }

      return Result.ok(result.value);
    } catch (error) {
      logger.error('MarkNotificationAsReadUseCase failed', { error, notificationId, userId });
      const err = error instanceof Error ? error : new Error('Failed to mark notification as read');
      return Result.fail(err);
    }
  }
}
