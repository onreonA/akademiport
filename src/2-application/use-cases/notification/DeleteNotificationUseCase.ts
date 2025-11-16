/**
 * Delete Notification Use Case
 *
 * Deletes a notification
 */

import { Result } from '@/6-core/result';
import { INotificationRepository } from '@/3-domain/interfaces/repositories/INotificationRepository';
import { logger } from '@/5-shared/utils/logger';

export class DeleteNotificationUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(notificationId: string, userId: string): Promise<Result<void>> {
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

      const result = await this.notificationRepository.delete(notificationId, userId);
      if (result.isFailure) {
        return Result.fail(result.error || new Error('Failed to delete notification'));
      }

      return Result.ok(undefined);
    } catch (error) {
      logger.error('DeleteNotificationUseCase failed', { error, notificationId, userId });
      const err = error instanceof Error ? error : new Error('Failed to delete notification');
      return Result.fail(err);
    }
  }
}
