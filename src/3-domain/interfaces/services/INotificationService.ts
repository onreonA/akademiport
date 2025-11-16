/**
 * Notification Service Interface
 *
 * Defines the contract for notification service
 */

import { Notification } from '../../entities/Notification';
import { NotificationPreferences } from '../../entities/NotificationPreferences';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
} from '../../enums/NotificationEnums';
import { Result } from '../../../6-core/result';

export interface CreateNotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  expiresAt?: Date;
}

export interface INotificationService {
  /**
   * Create and send notification
   */
  createNotification(options: CreateNotificationOptions): Promise<Result<Notification>>;

  /**
   * Create and send notifications to multiple users
   */
  createNotifications(
    userIds: string[],
    options: Omit<CreateNotificationOptions, 'userId'>
  ): Promise<Result<Notification[]>>;

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string, userId: string): Promise<Result<Notification>>;

  /**
   * Mark all notifications as read for user
   */
  markAllAsRead(userId: string): Promise<Result<number>>;

  /**
   * Delete notification
   */
  deleteNotification(notificationId: string, userId: string): Promise<Result<void>>;

  /**
   * Get user notifications
   */
  getUserNotifications(
    userId: string,
    options?: {
      isRead?: boolean;
      type?: NotificationType;
      limit?: number;
      offset?: number;
    }
  ): Promise<Result<Notification[]>>;

  /**
   * Get unread notification count
   */
  getUnreadCount(userId: string): Promise<Result<number>>;
}

export interface IPushNotificationService {
  /**
   * Send push notification
   */
  sendPushNotification(userId: string, notification: Notification): Promise<Result<void>>;

  /**
   * Send push notification to multiple users
   */
  sendPushNotifications(
    userIds: string[],
    notification: Omit<
      Notification,
      'id' | 'userId' | 'createdAt' | 'isRead' | 'emailSent' | 'pushSent'
    >
  ): Promise<Result<void>>;
}
