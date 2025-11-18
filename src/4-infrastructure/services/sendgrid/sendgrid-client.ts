/**
 * SendGrid Client
 *
 * SendGrid API client wrapper
 */

import sgMail from '@sendgrid/mail';
import { emailConfig, validateEmailConfig } from '@/4-infrastructure/config/email.config';
import { logger } from '@/5-shared/utils/logger';

// Initialize SendGrid (only if API key is available)
if (emailConfig.sendgrid.apiKey) {
  sgMail.setApiKey(emailConfig.sendgrid.apiKey);
}

export interface SendGridMessage {
  to: string | string[];
  from: string;
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type?: string;
    disposition?: string;
  }>;
  categories?: string[];
  customArgs?: Record<string, string>;
  trackingSettings?: {
    clickTracking?: {
      enable?: boolean;
    };
    openTracking?: {
      enable?: boolean;
    };
    subscriptionTracking?: {
      enable?: boolean;
    };
  };
}

export class SendGridClient {
  /**
   * Send email via SendGrid
   */
  static async send(message: SendGridMessage): Promise<{
    messageId: string;
    statusCode: number;
  }> {
    // Validate config at runtime
    if (!emailConfig.sendgrid.apiKey) {
      throw new Error('SENDGRID_API_KEY is not set');
    }
    sgMail.setApiKey(emailConfig.sendgrid.apiKey);
    try {
      const mailData: any = {
        ...message,
        from: message.from || emailConfig.sendgrid.fromEmail,
        text: message.text || message.html?.replace(/<[^>]*>/g, '') || '',
        trackingSettings: {
          clickTracking: {
            enable: emailConfig.tracking.clickTracking,
          },
          openTracking: {
            enable: emailConfig.tracking.openTracking,
          },
          subscriptionTracking: {
            enable: true,
          },
        },
      };
      const [response] = await sgMail.send(mailData);

      return {
        messageId: response.headers['x-message-id'] as string,
        statusCode: response.statusCode,
      };
    } catch (error: any) {
      logger.error('SendGrid send error:', error);
      throw new Error(`SendGrid send failed: ${error.message}`);
    }
  }

  /**
   * Send multiple emails via SendGrid
   */
  static async sendMultiple(messages: SendGridMessage[]): Promise<{
    messageIds: string[];
    statusCode: number;
  }> {
    // Validate config at runtime
    if (!emailConfig.sendgrid.apiKey) {
      throw new Error('SENDGRID_API_KEY is not set');
    }
    sgMail.setApiKey(emailConfig.sendgrid.apiKey);
    try {
      const responses = await sgMail.send(
        messages.map((msg) => ({
          ...msg,
          from: msg.from || emailConfig.sendgrid.fromEmail,
          text: msg.text || msg.html?.replace(/<[^>]*>/g, '') || '',
          trackingSettings: {
            clickTracking: {
              enable: emailConfig.tracking.clickTracking,
            },
            openTracking: {
              enable: emailConfig.tracking.openTracking,
            },
            subscriptionTracking: {
              enable: true,
            },
          },
        }))
      );

      const messageIds = responses.map(
        (response: any) => (response.headers?.['x-message-id'] as string) || ''
      );

      return {
        messageIds,
        statusCode: responses[0]?.statusCode || 200,
      };
    } catch (error: any) {
      logger.error('SendGrid sendMultiple error:', error);
      throw new Error(`SendGrid sendMultiple failed: ${error.message}`);
    }
  }
}
