/**
 * WhatsApp Business API Service
 *
 * Provides WhatsApp Business API integration for sending notifications
 * Used by Event and Appointment reminder systems
 *
 * Note: Requires WhatsApp Business API credentials (Sprint 16)
 */

import { logger } from '@/shared/utils/logger';

export interface WhatsAppMessage {
  to: string; // Phone number in E.164 format (e.g., +905551234567)
  template: string; // Template name (must be approved by WhatsApp)
  language: string; // Language code (e.g., 'tr', 'en')
  components?: Array<{
    type: 'header' | 'body' | 'button';
    parameters?: Array<{
      type: 'text' | 'image' | 'video' | 'document';
      text?: string;
      image?: { link: string };
      video?: { link: string };
      document?: { link: string };
    }>;
  }>;
}

export interface WhatsAppApiError {
  error: {
    message: string;
    type: string;
    code: number;
    error_data?: {
      details: string;
    };
  };
}

export class WhatsAppApiService {
  private static readonly API_BASE_URL =
    process.env.WHATSAPP_API_BASE_URL || 'https://graph.facebook.com/v18.0';
  private static readonly PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  private static readonly ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

  /**
   * Check if WhatsApp API is configured
   */
  static isAvailable(): boolean {
    return !!(this.PHONE_NUMBER_ID && this.ACCESS_TOKEN);
  }

  /**
   * Send WhatsApp message using template
   */
  static async sendTemplateMessage(message: WhatsAppMessage): Promise<boolean> {
    if (!this.isAvailable()) {
      logger.warn('WhatsApp API not configured. Message will not be sent.');
      return false;
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/${this.PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: message.to,
          type: 'template',
          template: {
            name: message.template,
            language: {
              code: message.language,
            },
            components: message.components || [],
          },
        }),
      });

      if (!response.ok) {
        const error: WhatsAppApiError = await response.json().catch(() => ({
          error: {
            message: 'Unknown error',
            type: 'unknown',
            code: response.status,
          },
        }));

        logger.error('WhatsApp API error sending message:', {
          status: response.status,
          errorCode: error.error.code,
          errorMessage: error.error.message,
          to: message.to,
          template: message.template,
        });

        return false;
      }

      const data = await response.json();
      logger.info(`WhatsApp message sent successfully:`, {
        messageId: data.messages?.[0]?.id,
        to: message.to,
        template: message.template,
      });

      return true;
    } catch (error) {
      logger.error('Error sending WhatsApp message:', {
        to: message.to,
        template: message.template,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Send event reminder via WhatsApp
   */
  static async sendEventReminder(
    phoneNumber: string,
    eventData: {
      eventTitle: string;
      eventDate: Date;
      eventTime: string;
      zoomJoinUrl?: string;
      programName?: string;
    },
    reminderType: '24hours' | '1hour'
  ): Promise<boolean> {
    const templateName = reminderType === '24hours' ? 'event_reminder_24h' : 'event_reminder_1h';

    const message: WhatsAppMessage = {
      to: phoneNumber,
      template: templateName,
      language: 'tr',
      components: [
        {
          type: 'body' as const,
          parameters: [
            {
              type: 'text' as const,
              text: eventData.eventTitle,
            },
            {
              type: 'text' as const,
              text: eventData.eventDate.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }),
            },
            {
              type: 'text' as const,
              text: eventData.eventTime,
            },
            ...(eventData.programName
              ? [
                  {
                    type: 'text' as const,
                    text: eventData.programName,
                  },
                ]
              : []),
          ],
        },
        ...(eventData.zoomJoinUrl
          ? [
              {
                type: 'button' as const,
                parameters: [
                  {
                    type: 'text' as const,
                    text: eventData.zoomJoinUrl,
                  },
                ],
              },
            ]
          : []),
      ],
    };

    return this.sendTemplateMessage(message);
  }

  /**
   * Send appointment reminder via WhatsApp
   */
  static async sendAppointmentReminder(
    phoneNumber: string,
    appointmentData: {
      appointmentTitle: string;
      appointmentDate: Date;
      appointmentTime: string;
      consultantName: string;
      companyName: string;
      zoomJoinUrl?: string;
    },
    reminderType: '24hours' | '1hour'
  ): Promise<boolean> {
    const templateName =
      reminderType === '24hours' ? 'appointment_reminder_24h' : 'appointment_reminder_1h';

    const message: WhatsAppMessage = {
      to: phoneNumber,
      template: templateName,
      language: 'tr',
      components: [
        {
          type: 'body' as const,
          parameters: [
            {
              type: 'text' as const,
              text: appointmentData.appointmentTitle,
            },
            {
              type: 'text' as const,
              text: appointmentData.appointmentDate.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }),
            },
            {
              type: 'text' as const,
              text: appointmentData.appointmentTime,
            },
            {
              type: 'text' as const,
              text: appointmentData.consultantName,
            },
            {
              type: 'text' as const,
              text: appointmentData.companyName,
            },
          ],
        },
        ...(appointmentData.zoomJoinUrl
          ? [
              {
                type: 'button' as const,
                parameters: [
                  {
                    type: 'text' as const,
                    text: appointmentData.zoomJoinUrl,
                  },
                ],
              },
            ]
          : []),
      ],
    };

    return this.sendTemplateMessage(message);
  }
}
