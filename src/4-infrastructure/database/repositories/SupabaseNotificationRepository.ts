/**
 * Supabase Notification Repository
 *
 * Implementation of INotificationRepository using Supabase
 */

import { Result } from '@/6-core/result';
import { Notification } from '@/3-domain/entities/Notification';
import {
  INotificationRepository,
  NotificationFilter,
} from '@/3-domain/interfaces/repositories/INotificationRepository';
import { getSupabaseAdminClient } from '@/4-infrastructure/database/supabase-server';
import { logger } from '@/5-shared/utils/logger';
import {
  NotificationType,
  NotificationPriority,
  NotificationChannel,
} from '@/3-domain/enums/NotificationEnums';

export class SupabaseNotificationRepository implements INotificationRepository {
  async create(notification: Notification): Promise<Result<Notification>> {
    try {
      const supabase = await getSupabaseAdminClient();

      const { data, error } = await supabase
        .from('notifications')
        .insert({
          id: notification.id,
          user_id: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          action_url: notification.actionUrl,
          metadata: notification.metadata,
          priority: notification.priority,
          is_read: notification.isRead,
          read_at: notification.readAt?.toISOString(),
          channels: notification.channels,
          email_sent: notification.emailSent,
          push_sent: notification.pushSent,
          expires_at: notification.expiresAt?.toISOString(),
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create notification', { error, notification });
        return Result.fail(new Error(`Failed to create notification: ${error.message}`));
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      logger.error('SupabaseNotificationRepository.create failed', { error, notification });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to create notification')
      );
    }
  }

  async createMany(notifications: Notification[]): Promise<Result<Notification[]>> {
    try {
      const supabase = await getSupabaseAdminClient();

      const insertData = notifications.map((n) => ({
        id: n.id,
        user_id: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        action_url: n.actionUrl,
        metadata: n.metadata,
        priority: n.priority,
        is_read: n.isRead,
        read_at: n.readAt?.toISOString(),
        channels: n.channels,
        email_sent: n.emailSent,
        push_sent: n.pushSent,
        expires_at: n.expiresAt?.toISOString(),
      }));

      const { data, error } = await supabase.from('notifications').insert(insertData).select();

      if (error) {
        logger.error('Failed to create notifications', { error });
        return Result.fail(new Error(`Failed to create notifications: ${error.message}`));
      }

      return Result.ok(data.map((d) => this.mapToEntity(d)));
    } catch (error) {
      logger.error('SupabaseNotificationRepository.createMany failed', { error });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to create notifications')
      );
    }
  }

  async findById(id: string): Promise<Result<Notification | null>> {
    try {
      const supabase = await getSupabaseAdminClient();

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return Result.ok(null);
        }
        logger.error('Failed to find notification', { error, id });
        return Result.fail(new Error(`Failed to find notification: ${error.message}`));
      }

      return Result.ok(data ? this.mapToEntity(data) : null);
    } catch (error) {
      logger.error('SupabaseNotificationRepository.findById failed', { error, id });
      return Result.fail(error instanceof Error ? error : new Error('Failed to find notification'));
    }
  }

  async findMany(filter: NotificationFilter): Promise<Result<Notification[]>> {
    try {
      const supabase = await getSupabaseAdminClient();

      let query = supabase.from('notifications').select('*').eq('user_id', filter.userId);

      // Apply filters
      if (filter.isRead !== undefined) {
        query = query.eq('is_read', filter.isRead);
      }
      if (filter.type) {
        query = query.eq('type', filter.type);
      }
      if (filter.priority) {
        query = query.eq('priority', filter.priority);
      }

      // Order by
      const orderBy = filter.orderBy || 'created_at';
      const orderDirection = filter.orderDirection || 'desc';
      query = query.order(orderBy, { ascending: orderDirection === 'asc' });

      // Pagination
      const limit = filter.limit || 20;
      const offset = filter.offset || 0;
      query = query.range(offset, offset + limit - 1);

      // Filter out expired notifications
      query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to find notifications', { error, filter });
        return Result.fail(new Error(`Failed to find notifications: ${error.message}`));
      }

      return Result.ok(data.map((d) => this.mapToEntity(d)));
    } catch (error) {
      logger.error('SupabaseNotificationRepository.findMany failed', { error, filter });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to find notifications')
      );
    }
  }

  async getUnreadCount(userId: string): Promise<Result<number>> {
    try {
      const supabase = await getSupabaseAdminClient();

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

      if (error) {
        logger.error('Failed to get unread count', { error, userId });
        return Result.fail(new Error(`Failed to get unread count: ${error.message}`));
      }

      return Result.ok(count || 0);
    } catch (error) {
      logger.error('SupabaseNotificationRepository.getUnreadCount failed', { error, userId });
      return Result.fail(error instanceof Error ? error : new Error('Failed to get unread count'));
    }
  }

  async markAsRead(id: string, userId: string): Promise<Result<Notification>> {
    try {
      const supabase = await getSupabaseAdminClient();

      const { data, error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to mark notification as read', { error, id, userId });
        return Result.fail(new Error(`Failed to mark notification as read: ${error.message}`));
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      logger.error('SupabaseNotificationRepository.markAsRead failed', { error, id, userId });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to mark notification as read')
      );
    }
  }

  async markAllAsRead(userId: string): Promise<Result<number>> {
    try {
      const supabase = await getSupabaseAdminClient();

      const { data, error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select();

      if (error) {
        logger.error('Failed to mark all notifications as read', { error, userId });
        return Result.fail(new Error(`Failed to mark all notifications as read: ${error.message}`));
      }

      return Result.ok(data?.length || 0);
    } catch (error) {
      logger.error('SupabaseNotificationRepository.markAllAsRead failed', { error, userId });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to mark all notifications as read')
      );
    }
  }

  async delete(id: string, userId: string): Promise<Result<void>> {
    try {
      const supabase = await getSupabaseAdminClient();

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        logger.error('Failed to delete notification', { error, id, userId });
        return Result.fail(new Error(`Failed to delete notification: ${error.message}`));
      }

      return Result.ok(undefined);
    } catch (error) {
      logger.error('SupabaseNotificationRepository.delete failed', { error, id, userId });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to delete notification')
      );
    }
  }

  async deleteExpired(): Promise<Result<number>> {
    try {
      const supabase = await getSupabaseAdminClient();

      const { data, error } = await supabase
        .from('notifications')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select();

      if (error) {
        logger.error('Failed to delete expired notifications', { error });
        return Result.fail(new Error(`Failed to delete expired notifications: ${error.message}`));
      }

      return Result.ok(data?.length || 0);
    } catch (error) {
      logger.error('SupabaseNotificationRepository.deleteExpired failed', { error });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to delete expired notifications')
      );
    }
  }

  async update(id: string, updates: Partial<Notification>): Promise<Result<Notification>> {
    try {
      const supabase = await getSupabaseAdminClient();

      const updateData: Record<string, unknown> = {};
      if (updates.emailSent !== undefined) updateData.email_sent = updates.emailSent;
      if (updates.pushSent !== undefined) updateData.push_sent = updates.pushSent;
      if (updates.isRead !== undefined) updateData.is_read = updates.isRead;
      if (updates.readAt !== undefined) updateData.read_at = updates.readAt?.toISOString();

      const { data, error } = await supabase
        .from('notifications')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update notification', { error, id, updates });
        return Result.fail(new Error(`Failed to update notification: ${error.message}`));
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      logger.error('SupabaseNotificationRepository.update failed', { error, id, updates });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to update notification')
      );
    }
  }

  private mapToEntity(data: any): Notification {
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type as NotificationType,
      title: data.title,
      message: data.message,
      actionUrl: data.action_url,
      metadata: data.metadata || {},
      priority: data.priority as NotificationPriority,
      isRead: data.is_read,
      readAt: data.read_at ? new Date(data.read_at) : undefined,
      channels: (data.channels || []) as NotificationChannel[],
      emailSent: data.email_sent,
      pushSent: data.push_sent,
      createdAt: new Date(data.created_at),
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
    };
  }
}
