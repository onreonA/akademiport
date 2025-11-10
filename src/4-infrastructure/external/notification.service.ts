/**
 * Notification Service
 *
 * Provides notification functionality for events and appointments
 * Supports email and WhatsApp notifications
 */

import { logger } from '@/shared/utils/logger';
import { WhatsAppApiService } from './whatsapp-api.service';

export interface NotificationRecipient {
  email: string;
  name?: string;
  userId?: string;
  phoneNumber?: string; // WhatsApp phone number in E.164 format (e.g., +905551234567)
}

export interface EventNotificationData {
  eventTitle: string;
  eventDescription?: string;
  eventDate: Date;
  eventTime: string;
  zoomJoinUrl?: string;
  zoomPassword?: string;
  organizerName: string;
  programName?: string;
}

export interface AppointmentNotificationData {
  appointmentTitle: string;
  appointmentDate: Date;
  appointmentTime: string;
  zoomJoinUrl?: string;
  zoomPassword?: string;
  consultantName: string;
  companyName: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rescheduled';
  notes?: string;
}

export interface NotificationResult {
  success: boolean;
  sentCount: number;
  failedCount: number;
  errors?: Array<{ recipient: string; error: string }>;
}

export class NotificationService {
  /**
   * Check if email notifications are enabled
   */
  static isEmailEnabled(): boolean {
    return process.env.EMAIL_ENABLED === 'true' && !!process.env.EMAIL_SERVICE_API_KEY;
  }

  /**
   * Check if WhatsApp notifications are enabled
   */
  static isWhatsAppEnabled(): boolean {
    return WhatsAppApiService.isAvailable();
  }

  /**
   * Send event reminder notification (Email + WhatsApp)
   */
  static async sendEventReminder(
    recipients: NotificationRecipient[],
    eventData: EventNotificationData,
    reminderType: '3days' | '1day' | '1hour' = '1day'
  ): Promise<NotificationResult> {
    const errors: Array<{ recipient: string; error: string }> = [];
    let emailSentCount = 0;
    let emailFailedCount = 0;
    let whatsappSentCount = 0;
    let whatsappFailedCount = 0;

    // Send email reminders
    if (this.isEmailEnabled()) {
      const subject = this.getEventReminderSubject(eventData, reminderType);
      const body = this.getEventReminderBody(eventData, reminderType);
      const emailResult = await this.sendBulkEmail(recipients, subject, body);
      emailSentCount = emailResult.sentCount;
      emailFailedCount = emailResult.failedCount;
      if (emailResult.errors) {
        errors.push(...emailResult.errors);
      }
    } else {
      logger.warn('Email notifications are disabled. Skipping email reminders.');
      emailFailedCount = recipients.length;
      errors.push(
        ...recipients.map((r) => ({
          recipient: r.email,
          error: 'Email notifications disabled',
        }))
      );
    }

    // Send WhatsApp reminders
    if (this.isWhatsAppEnabled()) {
      const whatsappReminderType: '24hours' | '1hour' =
        reminderType === '1day' ? '24hours' : reminderType === '1hour' ? '1hour' : '24hours';

      for (const recipient of recipients) {
        if (recipient.phoneNumber) {
          try {
            const success = await WhatsAppApiService.sendEventReminder(
              recipient.phoneNumber,
              {
                eventTitle: eventData.eventTitle,
                eventDate: eventData.eventDate,
                eventTime: eventData.eventTime,
                zoomJoinUrl: eventData.zoomJoinUrl,
                programName: eventData.programName,
              },
              whatsappReminderType
            );

            if (success) {
              whatsappSentCount++;
            } else {
              whatsappFailedCount++;
              errors.push({
                recipient: recipient.phoneNumber,
                error: 'WhatsApp message failed to send',
              });
            }
          } catch (error) {
            whatsappFailedCount++;
            errors.push({
              recipient: recipient.phoneNumber,
              error: error instanceof Error ? error.message : 'Unknown WhatsApp error',
            });
          }
        }
      }
    }

    return {
      success: emailFailedCount === 0 && whatsappFailedCount === 0,
      sentCount: emailSentCount + whatsappSentCount,
      failedCount: emailFailedCount + whatsappFailedCount,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Send appointment reminder notification (Email + WhatsApp)
   */
  static async sendAppointmentReminder(
    recipient: NotificationRecipient,
    appointmentData: AppointmentNotificationData,
    reminderType: '1day' | '1hour' = '1day'
  ): Promise<NotificationResult> {
    const errors: Array<{ recipient: string; error: string }> = [];
    let emailSentCount = 0;
    let emailFailedCount = 0;
    let whatsappSentCount = 0;
    let whatsappFailedCount = 0;

    // Send email reminder
    if (this.isEmailEnabled()) {
      const subject = this.getAppointmentReminderSubject(appointmentData, reminderType);
      const body = this.getAppointmentReminderBody(appointmentData, reminderType);
      const emailResult = await this.sendBulkEmail([recipient], subject, body);
      emailSentCount = emailResult.sentCount;
      emailFailedCount = emailResult.failedCount;
      if (emailResult.errors) {
        errors.push(...emailResult.errors);
      }
    } else {
      logger.warn('Email notifications are disabled. Skipping email reminder.');
      emailFailedCount = 1;
      errors.push({
        recipient: recipient.email,
        error: 'Email notifications disabled',
      });
    }

    // Send WhatsApp reminder
    if (this.isWhatsAppEnabled() && recipient.phoneNumber) {
      try {
        const whatsappReminderType: '24hours' | '1hour' =
          reminderType === '1day' ? '24hours' : '1hour';

        const success = await WhatsAppApiService.sendAppointmentReminder(
          recipient.phoneNumber,
          {
            appointmentTitle: appointmentData.appointmentTitle,
            appointmentDate: appointmentData.appointmentDate,
            appointmentTime: appointmentData.appointmentTime,
            consultantName: appointmentData.consultantName,
            companyName: appointmentData.companyName,
            zoomJoinUrl: appointmentData.zoomJoinUrl,
          },
          whatsappReminderType
        );

        if (success) {
          whatsappSentCount++;
        } else {
          whatsappFailedCount++;
          errors.push({
            recipient: recipient.phoneNumber,
            error: 'WhatsApp message failed to send',
          });
        }
      } catch (error) {
        whatsappFailedCount++;
        errors.push({
          recipient: recipient.phoneNumber,
          error: error instanceof Error ? error.message : 'Unknown WhatsApp error',
        });
      }
    }

    return {
      success: emailFailedCount === 0 && whatsappFailedCount === 0,
      sentCount: emailSentCount + whatsappSentCount,
      failedCount: emailFailedCount + whatsappFailedCount,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Send appointment confirmation notification
   */
  static async sendAppointmentConfirmation(
    recipient: NotificationRecipient,
    appointmentData: AppointmentNotificationData
  ): Promise<NotificationResult> {
    if (!this.isEmailEnabled()) {
      logger.warn('Email notifications are disabled. Skipping appointment confirmation.');
      return {
        success: false,
        sentCount: 0,
        failedCount: 1,
        errors: [{ recipient: recipient.email, error: 'Email notifications disabled' }],
      };
    }

    const subject = `Randevu Onaylandı: ${appointmentData.appointmentTitle}`;
    const body = this.getAppointmentConfirmationBody(appointmentData);

    return this.sendBulkEmail([recipient], subject, body);
  }

  /**
   * Send appointment cancellation notification
   */
  static async sendAppointmentCancellation(
    recipient: NotificationRecipient,
    appointmentData: AppointmentNotificationData,
    cancelledBy: 'consultant' | 'company',
    reason?: string
  ): Promise<NotificationResult> {
    if (!this.isEmailEnabled()) {
      logger.warn('Email notifications are disabled. Skipping appointment cancellation.');
      return {
        success: false,
        sentCount: 0,
        failedCount: 1,
        errors: [{ recipient: recipient.email, error: 'Email notifications disabled' }],
      };
    }

    const subject = `Randevu İptal Edildi: ${appointmentData.appointmentTitle}`;
    const body = this.getAppointmentCancellationBody(appointmentData, cancelledBy, reason);

    return this.sendBulkEmail([recipient], subject, body);
  }

  /**
   * Send bulk email (internal method)
   * TODO: Integrate with SendGrid or similar service in Sprint 15
   */
  private static async sendBulkEmail(
    recipients: NotificationRecipient[],
    subject: string,
    body: string
  ): Promise<NotificationResult> {
    // Placeholder implementation - will be replaced with real email service in Sprint 15
    logger.info(`[NotificationService] Would send email to ${recipients.length} recipients`);
    logger.info(`Subject: ${subject}`);
    logger.info(`Body preview: ${body.substring(0, 100)}...`);

    // Simulate email sending
    const errors: Array<{ recipient: string; error: string }> = [];
    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      try {
        // TODO: Replace with actual email service call
        // await emailService.send({ to: recipient.email, subject, html: body });
        sentCount++;
      } catch (error) {
        failedCount++;
        errors.push({
          recipient: recipient.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      success: failedCount === 0,
      sentCount,
      failedCount,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Get event reminder email subject
   */
  private static getEventReminderSubject(
    eventData: EventNotificationData,
    reminderType: '3days' | '1day' | '1hour'
  ): string {
    const timeText =
      reminderType === '3days' ? '3 gün sonra' : reminderType === '1day' ? 'yarın' : '1 saat sonra';

    return `Etkinlik Hatırlatması: ${eventData.eventTitle} - ${timeText}`;
  }

  /**
   * Get event reminder email body
   */
  private static getEventReminderBody(
    eventData: EventNotificationData,
    reminderType: '3days' | '1day' | '1hour'
  ): string {
    const timeText =
      reminderType === '3days' ? '3 gün sonra' : reminderType === '1day' ? 'yarın' : '1 saat sonra';

    let body = `
      <h2>Etkinlik Hatırlatması</h2>
      <p>Merhaba,</p>
      <p><strong>${eventData.eventTitle}</strong> etkinliği ${timeText} gerçekleşecek.</p>
      <p><strong>Tarih:</strong> ${eventData.eventDate.toLocaleDateString('tr-TR')}</p>
      <p><strong>Saat:</strong> ${eventData.eventTime}</p>
    `;

    if (eventData.programName) {
      body += `<p><strong>Program:</strong> ${eventData.programName}</p>`;
    }

    if (eventData.eventDescription) {
      body += `<p><strong>Açıklama:</strong> ${eventData.eventDescription}</p>`;
    }

    if (eventData.zoomJoinUrl) {
      body += `
        <p><strong>Zoom Linki:</strong> <a href="${eventData.zoomJoinUrl}">Etkinliğe Katıl</a></p>
      `;
      if (eventData.zoomPassword) {
        body += `<p><strong>Zoom Şifresi:</strong> ${eventData.zoomPassword}</p>`;
      }
    }

    body += `
      <p>Saygılarımızla,<br>${eventData.organizerName}</p>
    `;

    return body;
  }

  /**
   * Get appointment reminder email subject
   */
  private static getAppointmentReminderSubject(
    appointmentData: AppointmentNotificationData,
    reminderType: '1day' | '1hour'
  ): string {
    const timeText = reminderType === '1day' ? 'yarın' : '1 saat sonra';
    return `Randevu Hatırlatması: ${appointmentData.appointmentTitle} - ${timeText}`;
  }

  /**
   * Get appointment reminder email body
   */
  private static getAppointmentReminderBody(
    appointmentData: AppointmentNotificationData,
    reminderType: '1day' | '1hour'
  ): string {
    const timeText = reminderType === '1day' ? 'yarın' : '1 saat sonra';

    let body = `
      <h2>Randevu Hatırlatması</h2>
      <p>Merhaba,</p>
      <p><strong>${appointmentData.appointmentTitle}</strong> randevunuz ${timeText} gerçekleşecek.</p>
      <p><strong>Tarih:</strong> ${appointmentData.appointmentDate.toLocaleDateString('tr-TR')}</p>
      <p><strong>Saat:</strong> ${appointmentData.appointmentTime}</p>
      <p><strong>Danışman:</strong> ${appointmentData.consultantName}</p>
    `;

    if (appointmentData.notes) {
      body += `<p><strong>Notlar:</strong> ${appointmentData.notes}</p>`;
    }

    if (appointmentData.zoomJoinUrl) {
      body += `
        <p><strong>Zoom Linki:</strong> <a href="${appointmentData.zoomJoinUrl}">Randevuya Katıl</a></p>
      `;
      if (appointmentData.zoomPassword) {
        body += `<p><strong>Zoom Şifresi:</strong> ${appointmentData.zoomPassword}</p>`;
      }
    }

    body += `<p>Saygılarımızla,<br>Akademi Port Ekibi</p>`;

    return body;
  }

  /**
   * Get appointment confirmation email body
   */
  private static getAppointmentConfirmationBody(
    appointmentData: AppointmentNotificationData
  ): string {
    let body = `
      <h2>Randevu Onaylandı</h2>
      <p>Merhaba ${appointmentData.companyName},</p>
      <p><strong>${appointmentData.appointmentTitle}</strong> randevunuz onaylandı.</p>
      <p><strong>Tarih:</strong> ${appointmentData.appointmentDate.toLocaleDateString('tr-TR')}</p>
      <p><strong>Saat:</strong> ${appointmentData.appointmentTime}</p>
      <p><strong>Danışman:</strong> ${appointmentData.consultantName}</p>
    `;

    if (appointmentData.notes) {
      body += `<p><strong>Notlar:</strong> ${appointmentData.notes}</p>`;
    }

    if (appointmentData.zoomJoinUrl) {
      body += `
        <p><strong>Zoom Linki:</strong> <a href="${appointmentData.zoomJoinUrl}">Randevuya Katıl</a></p>
      `;
      if (appointmentData.zoomPassword) {
        body += `<p><strong>Zoom Şifresi:</strong> ${appointmentData.zoomPassword}</p>`;
      }
    }

    body += `<p>Saygılarımızla,<br>Akademi Port Ekibi</p>`;

    return body;
  }

  /**
   * Get appointment cancellation email body
   */
  private static getAppointmentCancellationBody(
    appointmentData: AppointmentNotificationData,
    cancelledBy: 'consultant' | 'company',
    reason?: string
  ): string {
    const cancelledByText = cancelledBy === 'consultant' ? 'danışman' : 'firma';

    let body = `
      <h2>Randevu İptal Edildi</h2>
      <p>Merhaba,</p>
      <p><strong>${appointmentData.appointmentTitle}</strong> randevusu ${cancelledByText} tarafından iptal edildi.</p>
      <p><strong>Tarih:</strong> ${appointmentData.appointmentDate.toLocaleDateString('tr-TR')}</p>
      <p><strong>Saat:</strong> ${appointmentData.appointmentTime}</p>
    `;

    if (reason) {
      body += `<p><strong>İptal Nedeni:</strong> ${reason}</p>`;
    }

    body += `<p>Yeni bir randevu oluşturmak için lütfen sistem üzerinden randevu talep edin.</p>`;
    body += `<p>Saygılarımızla,<br>Akademi Port Ekibi</p>`;

    return body;
  }
}
