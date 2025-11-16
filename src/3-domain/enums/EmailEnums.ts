/**
 * Email Type Enum
 */
export enum EmailType {
  TRANSACTIONAL = 'transactional',
  MARKETING = 'marketing',
  NOTIFICATION = 'notification',
}

/**
 * Email Status Enum
 */
export enum EmailStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  SENDING = 'sending',
  SENT = 'sent',
  FAILED = 'failed',
  BOUNCED = 'bounced',
  SPAM_REPORTED = 'spam_reported',
  UNSUBSCRIBED = 'unsubscribed',
}

/**
 * Email Priority Enum
 */
export enum EmailPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Email Type Labels
 */
export const EmailTypeLabels: Record<EmailType, string> = {
  [EmailType.TRANSACTIONAL]: 'İşlemsel',
  [EmailType.MARKETING]: 'Pazarlama',
  [EmailType.NOTIFICATION]: 'Bildirim',
};

/**
 * Email Status Labels
 */
export const EmailStatusLabels: Record<EmailStatus, string> = {
  [EmailStatus.PENDING]: 'Beklemede',
  [EmailStatus.QUEUED]: 'Kuyrukta',
  [EmailStatus.SENDING]: 'Gönderiliyor',
  [EmailStatus.SENT]: 'Gönderildi',
  [EmailStatus.FAILED]: 'Başarısız',
  [EmailStatus.BOUNCED]: 'Geri Döndü',
  [EmailStatus.SPAM_REPORTED]: 'Spam Olarak İşaretlendi',
  [EmailStatus.UNSUBSCRIBED]: 'Abonelik İptal Edildi',
};

/**
 * Email Priority Labels
 */
export const EmailPriorityLabels: Record<EmailPriority, string> = {
  [EmailPriority.LOW]: 'Düşük',
  [EmailPriority.NORMAL]: 'Normal',
  [EmailPriority.HIGH]: 'Yüksek',
  [EmailPriority.URGENT]: 'Acil',
};
