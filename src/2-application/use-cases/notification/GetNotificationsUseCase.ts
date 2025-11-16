/**
 * Get Notifications Use Case
 *
 * Retrieves notifications for a user with filters
 */

import { Result } from '@/6-core/result';
import { Notification } from '@/3-domain/entities/Notification';
import { INotificationRepository } from '@/3-domain/interfaces/repositories/INotificationRepository';
import { NotificationFilterDto } from '@/2-application/dtos/notification/NotificationFilterDto';
import { logger } from '@/5-shared/utils/logger';

export class GetNotificationsUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(filter: NotificationFilterDto): Promise<Result<Notification[]>> {
    try {
      const result = await this.notificationRepository.findMany({
        userId: filter.userId,
        isRead: filter.isRead,
        type: filter.type,
        priority: filter.priority,
        limit: filter.limit,
        offset: filter.offset,
        orderBy: filter.orderBy,
        orderDirection: filter.orderDirection,
      });

      if (result.isFailure) {
        return Result.fail(result.error || new Error('Failed to get notifications'));
      }

      return Result.ok(result.value);
    } catch (error) {
      logger.error('GetNotificationsUseCase failed', { error, filter });
      const err = error instanceof Error ? error : new Error('Failed to get notifications');
      return Result.fail(err);
    }
  }
}
