import { EmailType, EmailStatus, EmailPriority } from '../enums/EmailEnums';

/**
 * Email Template Entity
 */
export interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  mjmlContent?: string;
  emailType: EmailType;
  variables: Record<string, string>; // Variable name -> description
  version: number;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Email Queue Item Entity
 */
export interface EmailQueueItem {
  id: string;
  toEmail: string;
  toName?: string;
  ccEmails?: string[];
  bccEmails?: string[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  templateId?: string;
  templateName?: string;
  templateVariables?: Record<string, any>;
  fromEmail?: string;
  fromName?: string;
  replyTo?: string;
  priority: EmailPriority;
  status: EmailStatus;
  scheduledAt?: Date;
  sentAt?: Date;
  retryCount: number;
  maxRetries: number;
  lastRetryAt?: Date;
  errorMessage?: string;
  sendgridMessageId?: string;
  trackingEnabled: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Email Log Entity
 */
export interface EmailLog {
  id: string;
  queueId?: string;
  toEmail: string;
  subject: string;
  fromEmail?: string;
  sendgridMessageId?: string;
  status: EmailStatus;
  openedAt?: Date;
  openedCount: number;
  clickedAt?: Date;
  clickedCount: number;
  clickedLinks?: string[];
  bouncedAt?: Date;
  bounceReason?: string;
  spamReportedAt?: Date;
  unsubscribedAt?: Date;
  errorMessage?: string;
  errorCode?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Email Preferences Entity
 */
export interface EmailPreferences {
  id: string;
  userId: string;
  receiveTransactional: boolean;
  receiveMarketing: boolean;
  receiveNotifications: boolean;
  receiveAppointmentReminders: boolean;
  receiveEventReminders: boolean;
  receiveTaskReminders: boolean;
  receiveForumNotifications: boolean;
  receiveReportNotifications: boolean;
  unsubscribeToken: string;
  unsubscribedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Email Send Options
 */
export interface EmailSendOptions {
  to: string | string[];
  toName?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
  templateName?: string;
  templateVariables?: Record<string, any>;
  priority?: EmailPriority;
  scheduledAt?: Date;
  trackingEnabled?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Email Send Result
 */
export interface EmailSendResult {
  success: boolean;
  queueId?: string;
  sendgridMessageId?: string;
  error?: string;
}
