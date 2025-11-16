/**
 * Update Notification Preferences Use Case
 *
 * Updates user notification preferences
 */

import { Result } from '@/6-core/result';
import { NotificationPreferences } from '@/3-domain/entities/NotificationPreferences';
import { INotificationPreferencesRepository } from '@/3-domain/interfaces/repositories/INotificationRepository';
import { UpdateNotificationPreferencesDto } from '@/2-application/dtos/notification/UpdateNotificationPreferencesDto';
import { logger } from '@/5-shared/utils/logger';

export class UpdateNotificationPreferencesUseCase {
  constructor(private preferencesRepository: INotificationPreferencesRepository) {}

  async execute(
    userId: string,
    dto: UpdateNotificationPreferencesDto
  ): Promise<Result<NotificationPreferences>> {
    try {
      // Get existing preferences
      const findResult = await this.preferencesRepository.findByUserId(userId);
      let preferences: NotificationPreferences;

      if (findResult.isSuccess && findResult.value) {
        preferences = findResult.value;
      } else {
        // Create default preferences if not exists
        const { createDefaultNotificationPreferences } = await import(
          '@/3-domain/entities/NotificationPreferences'
        );
        preferences = createDefaultNotificationPreferences(userId);
        const createResult = await this.preferencesRepository.create(preferences);
        if (createResult.isFailure) {
          return Result.fail(
            createResult.error || new Error('Failed to create notification preferences')
          );
        }
        preferences = createResult.value;
      }

      // Update preferences
      const updates: Partial<NotificationPreferences> = {};

      if (dto.emailEnabled !== undefined) {
        updates.emailEnabled = dto.emailEnabled;
      }
      if (dto.pushEnabled !== undefined) {
        updates.pushEnabled = dto.pushEnabled;
      }
      if (dto.inAppEnabled !== undefined) {
        updates.inAppEnabled = dto.inAppEnabled;
      }
      if (dto.typePreferences !== undefined) {
        updates.typePreferences = {
          ...preferences.typePreferences,
          ...dto.typePreferences,
        };
      }
      if (dto.quietHoursStart !== undefined) {
        updates.quietHoursStart = dto.quietHoursStart;
      }
      if (dto.quietHoursEnd !== undefined) {
        updates.quietHoursEnd = dto.quietHoursEnd;
      }
      if (dto.quietHoursEnabled !== undefined) {
        updates.quietHoursEnabled = dto.quietHoursEnabled;
      }

      const result = await this.preferencesRepository.update(userId, updates);
      if (result.isFailure) {
        return Result.fail(result.error || new Error('Failed to update notification preferences'));
      }

      return Result.ok(result.value);
    } catch (error) {
      logger.error('UpdateNotificationPreferencesUseCase failed', { error, userId, dto });
      const err =
        error instanceof Error ? error : new Error('Failed to update notification preferences');
      return Result.fail(err);
    }
  }
}
