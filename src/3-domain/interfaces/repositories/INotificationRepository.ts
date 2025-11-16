/**
 * Notification Repository Interface
 *
 * Defines the contract for notification data access
 */

import { Notification } from '../../entities/Notification';
import { NotificationPreferences } from '../../entities/NotificationPreferences';
import { PushSubscription } from '../../entities/PushSubscription';
import { NotificationType, NotificationPriority } from '../../enums/NotificationEnums';
import { Result } from '../../../6-core/result';

export interface NotificationFilter {
  userId: string;
  isRead?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
  limit?: number;
  offset?: number;
  orderBy?: 'created_at' | 'priority' | 'type';
  orderDirection?: 'asc' | 'desc';
}

export interface INotificationRepository {
  /**
   * Create a new notification
   */
  create(notification: Notification): Promise<Result<Notification>>;

  /**
   * Create multiple notifications (bulk insert)
   */
  createMany(notifications: Notification[]): Promise<Result<Notification[]>>;

  /**
   * Get notification by ID
   */
  findById(id: string): Promise<Result<Notification | null>>;

  /**
   * Get notifications with filters
   */
  findMany(filter: NotificationFilter): Promise<Result<Notification[]>>;

  /**
   * Get unread notification count for user
   */
  getUnreadCount(userId: string): Promise<Result<number>>;

  /**
   * Mark notification as read
   */
  markAsRead(id: string, userId: string): Promise<Result<Notification>>;

  /**
   * Mark all notifications as read for user
   */
  markAllAsRead(userId: string): Promise<Result<number>>;

  /**
   * Delete notification
   */
  delete(id: string, userId: string): Promise<Result<void>>;

  /**
   * Delete expired notifications
   */
  deleteExpired(): Promise<Result<number>>;

  /**
   * Update notification (for marking email/push as sent)
   */
  update(id: string, updates: Partial<Notification>): Promise<Result<Notification>>;
}

export interface INotificationPreferencesRepository {
  /**
   * Get user notification preferences
   */
  findByUserId(userId: string): Promise<Result<NotificationPreferences | null>>;

  /**
   * Create notification preferences
   */
  create(preferences: NotificationPreferences): Promise<Result<NotificationPreferences>>;

  /**
   * Update notification preferences
   */
  update(
    userId: string,
    updates: Partial<NotificationPreferences>
  ): Promise<Result<NotificationPreferences>>;

  /**
   * Delete notification preferences
   */
  delete(userId: string): Promise<Result<void>>;
}

export interface IPushSubscriptionRepository {
  /**
   * Create push subscription
   */
  create(subscription: PushSubscription): Promise<Result<PushSubscription>>;

  /**
   * Get push subscriptions for user
   */
  findByUserId(userId: string): Promise<Result<PushSubscription[]>>;

  /**
   * Get push subscription by endpoint
   */
  findByEndpoint(userId: string, endpoint: string): Promise<Result<PushSubscription | null>>;

  /**
   * Delete push subscription
   */
  delete(id: string, userId: string): Promise<Result<void>>;

  /**
   * Delete push subscription by endpoint
   */
  deleteByEndpoint(userId: string, endpoint: string): Promise<Result<void>>;

  /**
   * Delete all push subscriptions for user
   */
  deleteByUserId(userId: string): Promise<Result<number>>;
}
