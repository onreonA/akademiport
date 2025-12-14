/**
 * Notification Triggers
 *
 * Helper functions for triggering notifications in use cases
 */

import { NotificationBroadcaster } from './notification-broadcaster';
import {
  NotificationType,
  NotificationPriority,
  NotificationChannel,
} from '@/3-domain/enums/NotificationEnums';
import { logger } from '@/5-shared/utils/logger';

/**
 * Trigger task assignment notification
 */
export async function triggerTaskAssignedNotification(
  broadcaster: NotificationBroadcaster,
  userId: string,
  taskId: string,
  taskTitle: string,
  assignedBy: string
): Promise<void> {
  const result = await broadcaster.broadcast({
    userIds: [userId],
    type: NotificationType.TASK_ASSIGNED,
    title: 'Yeni Görev Atandı',
    message: `${taskTitle} görevi size atandı.`,
    actionUrl: `/tasks/${taskId}`,
    metadata: {
      taskId,
      assignedBy,
    },
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
  });

  if (result.isFailure) {
    logger.error('Failed to trigger task assigned notification', {
      error: result.error,
      userId,
      taskId,
    });
  }
}

/**
 * Trigger task completion notification
 */
export async function triggerTaskCompletedNotification(
  broadcaster: NotificationBroadcaster,
  userId: string,
  taskId: string,
  taskTitle: string,
  completedBy: string
): Promise<void> {
  const result = await broadcaster.broadcast({
    userIds: [userId],
    type: NotificationType.TASK_COMPLETED,
    title: 'Görev Tamamlandı',
    message: `${taskTitle} görevi tamamlandı.`,
    actionUrl: `/tasks/${taskId}`,
    metadata: {
      taskId,
      completedBy,
    },
    priority: NotificationPriority.NORMAL,
    channels: [NotificationChannel.IN_APP],
  });

  if (result.isFailure) {
    logger.error('Failed to trigger task completed notification', {
      error: result.error,
      userId,
      taskId,
    });
  }
}

/**
 * Trigger event reminder notification
 */
export async function triggerEventReminderNotification(
  broadcaster: NotificationBroadcaster,
  userIds: string[],
  eventId: string,
  eventTitle: string,
  eventDate: Date
): Promise<void> {
  const result = await broadcaster.broadcast({
    userIds,
    type: NotificationType.EVENT_REMINDER,
    title: 'Etkinlik Hatırlatması',
    message: `${eventTitle} etkinliği ${eventDate.toLocaleDateString('tr-TR')} tarihinde gerçekleşecek.`,
    actionUrl: `/events/${eventId}`,
    metadata: {
      eventId,
      eventDate: eventDate.toISOString(),
    },
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH],
  });

  if (result.isFailure) {
    logger.error('Failed to trigger event reminder notification', {
      error: result.error,
      eventId,
      userIds: userIds.length,
    });
  }
}

/**
 * Trigger appointment confirmation notification
 */
export async function triggerAppointmentConfirmedNotification(
  broadcaster: NotificationBroadcaster,
  userId: string,
  appointmentId: string,
  appointmentDate: Date,
  consultantName: string
): Promise<void> {
  const result = await broadcaster.broadcast({
    userIds: [userId],
    type: NotificationType.APPOINTMENT_CONFIRMED,
    title: 'Randevu Onaylandı',
    message: `${appointmentDate.toLocaleDateString('tr-TR')} tarihindeki randevunuz ${consultantName} tarafından onaylandı.`,
    actionUrl: `/appointments/${appointmentId}`,
    metadata: {
      appointmentId,
      appointmentDate: appointmentDate.toISOString(),
      consultantName,
    },
    priority: NotificationPriority.NORMAL,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
  });

  if (result.isFailure) {
    logger.error('Failed to trigger appointment confirmed notification', {
      error: result.error,
      userId,
      appointmentId,
    });
  }
}

/**
 * Trigger forum reply notification
 */
export async function triggerForumReplyNotification(
  broadcaster: NotificationBroadcaster,
  userId: string,
  topicId: string,
  topicTitle: string,
  replyAuthor: string
): Promise<void> {
  const result = await broadcaster.broadcast({
    userIds: [userId],
    type: NotificationType.FORUM_REPLY,
    title: 'Forum Yanıtı',
    message: `${replyAuthor} "${topicTitle}" konusuna yanıt verdi.`,
    actionUrl: `/forum/topics/${topicId}`,
    metadata: {
      topicId,
      replyAuthor,
    },
    priority: NotificationPriority.NORMAL,
    channels: [NotificationChannel.IN_APP],
  });

  if (result.isFailure) {
    logger.error('Failed to trigger forum reply notification', {
      error: result.error,
      userId,
      topicId,
    });
  }
}

/**
 * Trigger badge earned notification
 */
export async function triggerBadgeEarnedNotification(
  broadcaster: NotificationBroadcaster,
  userId: string,
  badgeId: string,
  badgeName: string
): Promise<void> {
  const result = await broadcaster.broadcast({
    userIds: [userId],
    type: NotificationType.BADGE_EARNED,
    title: 'Yeni Rozet Kazandınız! 🏆',
    message: `"${badgeName}" rozetini kazandınız!`,
    actionUrl: `/leaderboard/badges`,
    metadata: {
      badgeId,
      badgeName,
    },
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  });

  if (result.isFailure) {
    logger.error('Failed to trigger badge earned notification', {
      error: result.error,
      userId,
      badgeId,
    });
  }
}
