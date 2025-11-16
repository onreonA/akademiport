/**
 * Notification Entity
 *
 * Domain entity for notifications
 */

import {
  NotificationType,
  NotificationPriority,
  NotificationChannel,
} from '../enums/NotificationEnums';

export interface NotificationMetadata {
  taskId?: string;
  eventId?: string;
  appointmentId?: string;
  projectId?: string;
  trainingId?: string;
  forumTopicId?: string;
  forumReplyId?: string;
  badgeId?: string;
  [key: string]: unknown;
}

export interface Notification {
  id: string;
  userId: string;

  // Content
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;

  // Metadata
  metadata: NotificationMetadata;
  priority: NotificationPriority;

  // Status
  isRead: boolean;
  readAt?: Date;

  // Channels
  channels: NotificationChannel[];
  emailSent: boolean;
  pushSent: boolean;

  // Timestamps
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * Create a new notification entity
 */
export function createNotification(
  data: Omit<Notification, 'id' | 'createdAt' | 'isRead' | 'emailSent' | 'pushSent'>
): Notification {
  return {
    id: crypto.randomUUID(),
    ...data,
    isRead: false,
    emailSent: false,
    pushSent: false,
    createdAt: new Date(),
  };
}

/**
 * Mark notification as read
 */
export function markNotificationAsRead(notification: Notification): Notification {
  return {
    ...notification,
    isRead: true,
    readAt: new Date(),
  };
}

/**
 * Check if notification is expired
 */
export function isNotificationExpired(notification: Notification): boolean {
  if (!notification.expiresAt) {
    return false;
  }
  return notification.expiresAt < new Date();
}

/**
 * Check if notification should be sent via email
 */
export function shouldSendEmail(notification: Notification): boolean {
  return notification.channels.includes(NotificationChannel.EMAIL);
}

/**
 * Check if notification should be sent via push
 */
export function shouldSendPush(notification: Notification): boolean {
  return notification.channels.includes(NotificationChannel.PUSH);
}
