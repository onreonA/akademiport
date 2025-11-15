/**
 * Activity Type Enum
 * Liderlik tablosu için aktivite tipleri
 */
export enum ActivityType {
  // Proje Yönetimi
  TASK_COMPLETED = 'task_completed',
  TASK_COMPLETED_EARLY = 'task_completed_early',
  SUBPROJECT_COMPLETED = 'subproject_completed',
  TASK_COMMENT = 'task_comment',

  // Eğitimler
  VIDEO_WATCHED = 'video_watched',
  DOCUMENT_READ = 'document_read',
  TRAINING_MODULE_COMPLETED = 'training_completed',

  // Etkinlikler
  EVENT_ATTENDED = 'event_attended',
  EVENT_ATTENDED_EARLY = 'event_attended_early',

  // Forum
  FORUM_TOPIC_CREATED = 'forum_topic_created',
  FORUM_REPLY_CREATED = 'forum_reply_created',
  FORUM_SOLUTION_MARKED = 'forum_solution_marked',

  // Haberler
  NEWS_READ = 'news_read',
  NEWS_READ_COMPLETED = 'news_read_completed',
  NEWS_COMMENT = 'news_comment',

  // Randevular
  APPOINTMENT_COMPLETED = 'appointment_completed',
  APPOINTMENT_NOTES = 'appointment_notes',

  // Rozetler
  BADGE_EARNED = 'badge_earned',
}

/**
 * Badge Category Enum
 */
export enum BadgeCategory {
  PROJECT = 'project',
  TRAINING = 'training',
  EVENT = 'event',
  FORUM = 'forum',
  NEWS = 'news',
  GENERAL = 'general',
}

export const BADGE_CATEGORY_LABELS: Record<BadgeCategory, string> = {
  [BadgeCategory.PROJECT]: 'Proje',
  [BadgeCategory.TRAINING]: 'Eğitim',
  [BadgeCategory.EVENT]: 'Etkinlik',
  [BadgeCategory.FORUM]: 'Forum',
  [BadgeCategory.NEWS]: 'Haberler',
  [BadgeCategory.GENERAL]: 'Genel',
};

/**
 * Requirement Type Enum
 */
export enum RequirementType {
  COUNT = 'count',
  STREAK = 'streak',
  MILESTONE = 'milestone',
  THRESHOLD = 'threshold',
}

export const REQUIREMENT_TYPE_LABELS: Record<RequirementType, string> = {
  [RequirementType.COUNT]: 'Sayı',
  [RequirementType.STREAK]: 'Seri',
  [RequirementType.MILESTONE]: 'Kilometre Taşı',
  [RequirementType.THRESHOLD]: 'Eşik Değeri',
};
