/**
 * Email Service
 *
 * SendGrid entegrasyonu ve email gönderimi
 */

import { IEmailService } from '@/3-domain/interfaces/services/IEmailService';
import { EmailSendOptions, EmailSendResult } from '@/3-domain/entities/Email';
import { EmailPriority, EmailStatus } from '@/3-domain/enums/EmailEnums';
import { Result } from '@/6-core/result/Result';
import { SendGridClient } from '@/4-infrastructure/services/sendgrid/sendgrid-client';
import { EmailTemplateService } from './email-template.service';
import { emailConfig } from '@/4-infrastructure/config/email.config';
import { logger } from '@/5-shared/utils/logger';
import { getSupabaseAdminClient } from '@/4-infrastructure/database/supabase-server';

export class EmailService implements IEmailService {
  private templateService: EmailTemplateService;

  constructor() {
    this.templateService = new EmailTemplateService();
  }

  /**
   * Send email directly (synchronous)
   */
  async send(options: EmailSendOptions): Promise<Result<EmailSendResult, Error>> {
    try {
      // Normalize recipients
      const toEmails = Array.isArray(options.to) ? options.to : [options.to];
      const toNames = Array.isArray(options.toName)
        ? options.toName
        : options.toName
          ? [options.toName]
          : undefined;

      // Prepare SendGrid message
      const message = {
        to: toEmails,
        from: options.from || emailConfig.sendgrid.fromEmail,
        fromName: options.fromName || emailConfig.sendgrid.fromName,
        subject: options.subject,
        html: options.html || '',
        text: options.text,
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo || emailConfig.sendgrid.replyTo,
        customArgs: {
          ...options.metadata,
          priority: options.priority || EmailPriority.NORMAL,
        },
      };

      // Send via SendGrid
      const result = await SendGridClient.send(message);

      // Log email
      await this.logEmail({
        toEmail: toEmails[0],
        subject: options.subject,
        fromEmail: message.from,
        sendgridMessageId: result.messageId,
        status: EmailStatus.SENT,
      });

      return Result.ok({
        success: true,
        sendgridMessageId: result.messageId,
      });
    } catch (error: any) {
      logger.error('EmailService.send error:', error);

      // Log failed email
      await this.logEmail({
        toEmail: Array.isArray(options.to) ? options.to[0] : options.to,
        subject: options.subject,
        fromEmail: options.from || emailConfig.sendgrid.fromEmail,
        status: EmailStatus.FAILED,
        errorMessage: error.message,
      });

      return Result.fail(error);
    }
  }

  /**
   * Send email using template
   */
  async sendTemplate(
    templateName: string,
    to: string | string[],
    variables: Record<string, any>,
    options?: Partial<EmailSendOptions>
  ): Promise<Result<EmailSendResult, Error>> {
    try {
      // Validate variables
      const validationResult = await this.templateService.validateVariables(
        templateName,
        variables
      );
      if (validationResult.isFailure) {
        return Result.fail(validationResult.error!);
      }

      // Render template
      const renderResult = await this.templateService.renderTemplate(templateName, variables);
      if (renderResult.isFailure) {
        return Result.fail(renderResult.error!);
      }

      const { html, text, subject } = renderResult.value!;

      // Send email
      return await this.send({
        to,
        toName: options?.toName,
        subject: options?.subject || subject,
        html,
        text,
        from: options?.from,
        fromName: options?.fromName,
        replyTo: options?.replyTo,
        priority: options?.priority,
        trackingEnabled: options?.trackingEnabled,
        metadata: {
          ...options?.metadata,
          templateName,
        },
      });
    } catch (error: any) {
      logger.error('EmailService.sendTemplate error:', error);
      return Result.fail(error);
    }
  }

  /**
   * Queue email for later sending
   */
  async queue(options: EmailSendOptions): Promise<Result<string, Error>> {
    try {
      const toEmails = Array.isArray(options.to) ? options.to : [options.to];
      const toNames = Array.isArray(options.toName)
        ? options.toName
        : options.toName
          ? [options.toName]
          : undefined;

      const supabase = getSupabaseAdminClient();
      const { data, error } = await supabase
        .from('email_queue')
        .insert({
          to_email: toEmails[0],
          to_name: toNames?.[0],
          cc_emails: options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : null,
          bcc_emails: options.bcc
            ? Array.isArray(options.bcc)
              ? options.bcc
              : [options.bcc]
            : null,
          subject: options.subject,
          html_content: options.html || '',
          text_content: options.text,
          template_name: options.templateName,
          template_variables: options.templateVariables || {},
          from_email: options.from || emailConfig.sendgrid.fromEmail,
          from_name: options.fromName || emailConfig.sendgrid.fromName,
          reply_to: options.replyTo || emailConfig.sendgrid.replyTo,
          priority: options.priority || EmailPriority.NORMAL,
          status: EmailStatus.PENDING,
          scheduled_at: options.scheduledAt?.toISOString(),
          tracking_enabled: options.trackingEnabled !== false,
          metadata: options.metadata || {},
        })
        .select('id')
        .single();

      if (error) {
        logger.error('EmailService.queue error:', error);
        return Result.fail(new Error(`Failed to queue email: ${error.message}`));
      }

      return Result.ok(data.id);
    } catch (error: any) {
      logger.error('EmailService.queue error:', error);
      return Result.fail(error);
    }
  }

  /**
   * Send queued email
   */
  async sendQueued(queueId: string): Promise<Result<EmailSendResult, Error>> {
    try {
      const supabase = getSupabaseAdminClient();
      // Get queued email
      const { data: queueItem, error: fetchError } = await supabase
        .from('email_queue')
        .select('*')
        .eq('id', queueId)
        .single();

      if (fetchError || !queueItem) {
        return Result.fail(new Error(`Queue item not found: ${queueId}`));
      }

      const supabase = getSupabaseAdminClient();
      // Update status to sending
      await supabase.from('email_queue').update({ status: EmailStatus.SENDING }).eq('id', queueId);

      // Send email
      let sendResult: EmailSendResult;
      if (queueItem.template_name) {
        // Send using template
        const templateResult = await this.sendTemplate(
          queueItem.template_name,
          queueItem.to_email,
          queueItem.template_variables || {},
          {
            from: queueItem.from_email,
            fromName: queueItem.from_name,
            replyTo: queueItem.reply_to,
            priority: queueItem.priority,
            trackingEnabled: queueItem.tracking_enabled,
          }
        );

        if (templateResult.isFailure) {
          // Update status to failed
          await supabase
            .from('email_queue')
            .update({
              status: EmailStatus.FAILED,
              error_message: templateResult.error!.message,
              retry_count: queueItem.retry_count + 1,
              last_retry_at: new Date().toISOString(),
            })
            .eq('id', queueId);

          return Result.fail(templateResult.error!);
        }

        sendResult = templateResult.value!;
      } else {
        // Send directly
        const directResult = await this.send({
          to: queueItem.to_email,
          toName: queueItem.to_name,
          subject: queueItem.subject,
          html: queueItem.html_content,
          text: queueItem.text_content,
          from: queueItem.from_email,
          fromName: queueItem.from_name,
          replyTo: queueItem.reply_to,
          priority: queueItem.priority,
          trackingEnabled: queueItem.tracking_enabled,
        });

        if (directResult.isFailure) {
          // Update status to failed
          await supabase
            .from('email_queue')
            .update({
              status: EmailStatus.FAILED,
              error_message: directResult.error!.message,
              retry_count: queueItem.retry_count + 1,
              last_retry_at: new Date().toISOString(),
            })
            .eq('id', queueId);

          return Result.fail(directResult.error!);
        }

        sendResult = directResult.value!;
      }

      // Update status to sent
      await supabase
        .from('email_queue')
        .update({
          status: EmailStatus.SENT,
          sent_at: new Date().toISOString(),
          sendgrid_message_id: sendResult.sendgridMessageId,
        })
        .eq('id', queueId);

      return Result.ok(sendResult);
    } catch (error: any) {
      logger.error('EmailService.sendQueued error:', error);
      return Result.fail(error);
    }
  }

  /**
   * Log email to email_logs table
   */
  private async logEmail(logData: {
    toEmail: string;
    subject: string;
    fromEmail?: string;
    sendgridMessageId?: string;
    status: EmailStatus;
    errorMessage?: string;
    errorCode?: string;
  }): Promise<void> {
    try {
      const supabase = getSupabaseAdminClient();
      await supabase.from('email_logs').insert({
        to_email: logData.toEmail,
        subject: logData.subject,
        from_email: logData.fromEmail,
        sendgrid_message_id: logData.sendgridMessageId,
        status: logData.status,
        error_message: logData.errorMessage,
        error_code: logData.errorCode,
      });
    } catch (error) {
      logger.error('EmailService.logEmail error:', error);
      // Don't throw, logging is not critical
    }
  }
}
