/**
 * Topic Status Enum
 */
export enum TopicStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  SOLVED = 'solved',
  ARCHIVED = 'archived',
}

export const TOPIC_STATUS_LABELS: Record<TopicStatus, string> = {
  [TopicStatus.OPEN]: 'Açık',
  [TopicStatus.CLOSED]: 'Kapalı',
  [TopicStatus.SOLVED]: 'Çözüldü',
  [TopicStatus.ARCHIVED]: 'Arşivlendi',
};

export const TOPIC_STATUS_COLORS: Record<TopicStatus, string> = {
  [TopicStatus.OPEN]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [TopicStatus.CLOSED]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  [TopicStatus.SOLVED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  [TopicStatus.ARCHIVED]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

/**
 * Topic Priority Enum
 */
export enum TopicPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export const TOPIC_PRIORITY_LABELS: Record<TopicPriority, string> = {
  [TopicPriority.LOW]: 'Düşük',
  [TopicPriority.NORMAL]: 'Normal',
  [TopicPriority.HIGH]: 'Yüksek',
  [TopicPriority.URGENT]: 'Acil',
};

export const TOPIC_PRIORITY_COLORS: Record<TopicPriority, string> = {
  [TopicPriority.LOW]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  [TopicPriority.NORMAL]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [TopicPriority.HIGH]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  [TopicPriority.URGENT]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

