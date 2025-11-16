/**
 * Supabase Notification Preferences Repository
 *
 * Implementation of INotificationPreferencesRepository using Supabase
 */

import { Result } from '@/6-core/result';
import { NotificationPreferences } from '@/3-domain/entities/NotificationPreferences';
import { INotificationPreferencesRepository } from '@/3-domain/interfaces/repositories/INotificationRepository';
import { getSupabaseAdminClient } from '@/4-infrastructure/database/supabase-server';
import { logger } from '@/5-shared/utils/logger';

export class SupabaseNotificationPreferencesRepository
  implements INotificationPreferencesRepository
{
  async findByUserId(userId: string): Promise<Result<NotificationPreferences | null>> {
    try {
      const supabase = await getSupabaseAdminClient();

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return Result.ok(null);
        }
        logger.error('Failed to find notification preferences', { error, userId });
        return Result.fail(new Error(`Failed to find notification preferences: ${error.message}`));
      }

      return Result.ok(data ? this.mapToEntity(data) : null);
    } catch (error) {
      logger.error('SupabaseNotificationPreferencesRepository.findByUserId failed', {
        error,
        userId,
      });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to find notification preferences')
      );
    }
  }

  async create(preferences: NotificationPreferences): Promise<Result<NotificationPreferences>> {
    try {
      const supabase = await getSupabaseAdminClient();

      const { data, error } = await supabase
        .from('notification_preferences')
        .insert({
          id: preferences.id,
          user_id: preferences.userId,
          email_enabled: preferences.emailEnabled,
          push_enabled: preferences.pushEnabled,
          in_app_enabled: preferences.inAppEnabled,
          type_preferences: preferences.typePreferences,
          quiet_hours_start: preferences.quietHoursStart,
          quiet_hours_end: preferences.quietHoursEnd,
          quiet_hours_enabled: preferences.quietHoursEnabled,
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create notification preferences', { error, preferences });
        return Result.fail(
          new Error(`Failed to create notification preferences: ${error.message}`)
        );
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      logger.error('SupabaseNotificationPreferencesRepository.create failed', {
        error,
        preferences,
      });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to create notification preferences')
      );
    }
  }

  async update(
    userId: string,
    updates: Partial<NotificationPreferences>
  ): Promise<Result<NotificationPreferences>> {
    try {
      const supabase = await getSupabaseAdminClient();

      const updateData: Record<string, unknown> = {};
      if (updates.emailEnabled !== undefined) updateData.email_enabled = updates.emailEnabled;
      if (updates.pushEnabled !== undefined) updateData.push_enabled = updates.pushEnabled;
      if (updates.inAppEnabled !== undefined) updateData.in_app_enabled = updates.inAppEnabled;
      if (updates.typePreferences !== undefined)
        updateData.type_preferences = updates.typePreferences;
      if (updates.quietHoursStart !== undefined)
        updateData.quiet_hours_start = updates.quietHoursStart;
      if (updates.quietHoursEnd !== undefined) updateData.quiet_hours_end = updates.quietHoursEnd;
      if (updates.quietHoursEnabled !== undefined)
        updateData.quiet_hours_enabled = updates.quietHoursEnabled;

      const { data, error } = await supabase
        .from('notification_preferences')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update notification preferences', { error, userId, updates });
        return Result.fail(
          new Error(`Failed to update notification preferences: ${error.message}`)
        );
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      logger.error('SupabaseNotificationPreferencesRepository.update failed', {
        error,
        userId,
        updates,
      });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to update notification preferences')
      );
    }
  }

  async delete(userId: string): Promise<Result<void>> {
    try {
      const supabase = await getSupabaseAdminClient();

      const { error } = await supabase
        .from('notification_preferences')
        .delete()
        .eq('user_id', userId);

      if (error) {
        logger.error('Failed to delete notification preferences', { error, userId });
        return Result.fail(
          new Error(`Failed to delete notification preferences: ${error.message}`)
        );
      }

      return Result.ok(undefined);
    } catch (error) {
      logger.error('SupabaseNotificationPreferencesRepository.delete failed', { error, userId });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to delete notification preferences')
      );
    }
  }

  private mapToEntity(data: any): NotificationPreferences {
    return {
      id: data.id,
      userId: data.user_id,
      emailEnabled: data.email_enabled,
      pushEnabled: data.push_enabled,
      inAppEnabled: data.in_app_enabled,
      typePreferences: data.type_preferences || {},
      quietHoursStart: data.quiet_hours_start,
      quietHoursEnd: data.quiet_hours_end,
      quietHoursEnabled: data.quiet_hours_enabled,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
