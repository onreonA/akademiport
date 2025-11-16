/**
 * Notification Enums
 *
 * Enums for notification system
 */

/**
 * Notification Priority Levels
 */
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Notification Channels
 */
export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
}

/**
 * Notification Types
 * Extends the existing notification_type enum from database
 */
export enum NotificationType {
  // General types
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',

  // Task-related
  TASK_ASSIGNED = 'task_assigned',
  TASK_COMPLETED = 'task_completed',
  TASK_DEADLINE_APPROACHING = 'deadline_approaching',
  TASK_REVIEW_REQUESTED = 'task_review_requested',
  TASK_APPROVED = 'task_approved',
  TASK_REJECTED = 'task_rejected',

  // Event-related
  EVENT_REMINDER = 'event_reminder',
  EVENT_CANCELLED = 'event_cancelled',
  EVENT_UPDATED = 'event_updated',

  // Appointment-related
  APPOINTMENT_CONFIRMED = 'appointment_confirmed',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  APPOINTMENT_RESCHEDULED = 'appointment_rescheduled',

  // Project-related
  PROJECT_ASSIGNED = 'project_assigned',
  PROJECT_UPDATED = 'project_updated',
  PROJECT_COMPLETED = 'project_completed',

  // Training-related
  TRAINING_ASSIGNED = 'training_assigned',
  TRAINING_COMPLETED = 'training_completed',
  TRAINING_DEADLINE_APPROACHING = 'training_deadline_approaching',

  // E-commerce related
  ECOMMERCE_METRICS_REMINDER = 'ecommerce_metrics_reminder',

  // Forum-related
  FORUM_REPLY = 'forum_reply',
  FORUM_MENTION = 'forum_mention',
  FORUM_TOPIC_APPROVED = 'forum_topic_approved',
  FORUM_TOPIC_REJECTED = 'forum_topic_rejected',

  // Leaderboard-related
  BADGE_EARNED = 'badge_earned',
  RANKING_CHANGED = 'ranking_changed',
}

/**
 * Notification Status
 */
export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
}

/**
 * Get notification priority label
 */
export function getNotificationPriorityLabel(priority: NotificationPriority): string {
  const labels: Record<NotificationPriority, string> = {
    [NotificationPriority.LOW]: 'Düşük',
    [NotificationPriority.NORMAL]: 'Normal',
    [NotificationPriority.HIGH]: 'Yüksek',
    [NotificationPriority.URGENT]: 'Acil',
  };
  return labels[priority];
}

/**
 * Get notification channel label
 */
export function getNotificationChannelLabel(channel: NotificationChannel): string {
  const labels: Record<NotificationChannel, string> = {
    [NotificationChannel.IN_APP]: 'Uygulama İçi',
    [NotificationChannel.EMAIL]: 'E-posta',
    [NotificationChannel.PUSH]: 'Push Bildirimi',
    [NotificationChannel.SMS]: 'SMS',
  };
  return labels[channel];
}

/**
 * Get notification type label
 */
export function getNotificationTypeLabel(type: NotificationType): string {
  const labels: Record<NotificationType, string> = {
    [NotificationType.INFO]: 'Bilgilendirme',
    [NotificationType.SUCCESS]: 'Başarı',
    [NotificationType.WARNING]: 'Uyarı',
    [NotificationType.ERROR]: 'Hata',
    [NotificationType.TASK_ASSIGNED]: 'Görev Atandı',
    [NotificationType.TASK_COMPLETED]: 'Görev Tamamlandı',
    [NotificationType.TASK_DEADLINE_APPROACHING]: 'Görev Son Tarihi Yaklaşıyor',
    [NotificationType.TASK_REVIEW_REQUESTED]: 'Görev İnceleme İstendi',
    [NotificationType.TASK_APPROVED]: 'Görev Onaylandı',
    [NotificationType.TASK_REJECTED]: 'Görev Reddedildi',
    [NotificationType.EVENT_REMINDER]: 'Etkinlik Hatırlatması',
    [NotificationType.EVENT_CANCELLED]: 'Etkinlik İptal Edildi',
    [NotificationType.EVENT_UPDATED]: 'Etkinlik Güncellendi',
    [NotificationType.APPOINTMENT_CONFIRMED]: 'Randevu Onaylandı',
    [NotificationType.APPOINTMENT_CANCELLED]: 'Randevu İptal Edildi',
    [NotificationType.APPOINTMENT_REMINDER]: 'Randevu Hatırlatması',
    [NotificationType.APPOINTMENT_RESCHEDULED]: 'Randevu Yeniden Planlandı',
    [NotificationType.PROJECT_ASSIGNED]: 'Proje Atandı',
    [NotificationType.PROJECT_UPDATED]: 'Proje Güncellendi',
    [NotificationType.PROJECT_COMPLETED]: 'Proje Tamamlandı',
    [NotificationType.TRAINING_ASSIGNED]: 'Eğitim Atandı',
    [NotificationType.TRAINING_COMPLETED]: 'Eğitim Tamamlandı',
    [NotificationType.TRAINING_DEADLINE_APPROACHING]: 'Eğitim Son Tarihi Yaklaşıyor',
    [NotificationType.ECOMMERCE_METRICS_REMINDER]: 'E-Ticaret Metrikleri Hatırlatması',
    [NotificationType.FORUM_REPLY]: 'Forum Yanıtı',
    [NotificationType.FORUM_MENTION]: 'Forum Bahsedilme',
    [NotificationType.FORUM_TOPIC_APPROVED]: 'Forum Konusu Onaylandı',
    [NotificationType.FORUM_TOPIC_REJECTED]: 'Forum Konusu Reddedildi',
    [NotificationType.BADGE_EARNED]: 'Rozet Kazanıldı',
    [NotificationType.RANKING_CHANGED]: 'Sıralama Değişti',
  };
  return labels[type] || type;
}
