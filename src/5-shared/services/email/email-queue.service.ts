/**
 * Email Queue Service
 *
 * Email kuyruk yönetimi ve işleme
 */

import { IEmailQueueService } from '@/3-domain/interfaces/services/IEmailQueueService';
import { EmailQueueItem } from '@/3-domain/entities/Email';
import { EmailStatus, EmailPriority } from '@/3-domain/enums/EmailEnums';
import { Result } from '@/6-core/result/Result';
import { getSupabaseAdminClient } from '@/4-infrastructure/database/supabase-server';
import { EmailService } from './email.service';
import { emailConfig } from '@/4-infrastructure/config/email.config';
import { logger } from '@/5-shared/utils/logger';

export class EmailQueueService implements IEmailQueueService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Add email to queue
   */
  async enqueue(item: Partial<EmailQueueItem>): Promise<Result<string>> {
    try {
      const supabase = getSupabaseAdminClient();

      const { data, error } = await supabase
        .from('email_queue')
        .insert({
          to_email: item.toEmail!,
          to_name: item.toName,
          cc_emails: item.ccEmails,
          bcc_emails: item.bccEmails,
          subject: item.subject!,
          html_content: item.htmlContent!,
          text_content: item.textContent,
          template_id: item.templateId,
          template_name: item.templateName,
          template_variables: item.templateVariables,
          from_email: item.fromEmail,
          from_name: item.fromName,
          reply_to: item.replyTo,
          priority: item.priority || EmailPriority.NORMAL,
          status: EmailStatus.PENDING,
          scheduled_at: item.scheduledAt?.toISOString(),
          retry_count: item.retryCount || 0,
          max_retries: item.maxRetries || emailConfig.queue.maxRetries,
          tracking_enabled: item.trackingEnabled !== false,
          metadata: item.metadata,
        })
        .select('id')
        .single();

      if (error) {
        logger.error('EmailQueueService.enqueue error:', error);
        return Result.fail(new Error(`Failed to enqueue email: ${error.message}`));
      }

      return Result.ok(data.id);
    } catch (error: any) {
      logger.error('EmailQueueService.enqueue error:', error);
      return Result.fail(error);
    }
  }

  /**
   * Process pending emails
   */
  async processQueue(limit: number = emailConfig.queue.batchSize): Promise<Result<number>> {
    try {
      const supabase = getSupabaseAdminClient();

      // Get pending emails ordered by priority and created_at
      const { data: queueItems, error } = await supabase
        .from('email_queue')
        .select('*')
        .eq('status', EmailStatus.PENDING)
        .is('scheduled_at', null) // Not scheduled
        .order('priority', { ascending: false }) // URGENT first
        .order('created_at', { ascending: true }) // Oldest first
        .limit(limit);

      if (error) {
        logger.error('EmailQueueService.processQueue error:', error);
        return Result.fail(new Error(`Failed to fetch queue items: ${error.message}`));
      }

      if (!queueItems || queueItems.length === 0) {
        return Result.ok(0);
      }

      let processed = 0;
      for (const item of queueItems) {
        try {
          const result = await this.emailService.sendQueued(item.id);
          if (result.isSuccess) {
            processed++;
          }
        } catch (error: any) {
          logger.error(`Failed to process queue item ${item.id}:`, error);
        }
      }

      return Result.ok(processed);
    } catch (error: any) {
      logger.error('EmailQueueService.processQueue error:', error);
      return Result.fail(error);
    }
  }

  /**
   * Process scheduled emails
   */
  async processScheduled(): Promise<Result<number>> {
    try {
      const supabase = getSupabaseAdminClient();
      const now = new Date().toISOString();

      // Get scheduled emails that are ready to send
      const { data: queueItems, error } = await supabase
        .from('email_queue')
        .select('*')
        .eq('status', EmailStatus.PENDING)
        .lte('scheduled_at', now)
        .order('scheduled_at', { ascending: true })
        .limit(emailConfig.queue.batchSize);

      if (error) {
        logger.error('EmailQueueService.processScheduled error:', error);
        return Result.fail(new Error(`Failed to fetch scheduled emails: ${error.message}`));
      }

      if (!queueItems || queueItems.length === 0) {
        return Result.ok(0);
      }

      let processed = 0;
      for (const item of queueItems) {
        try {
          const result = await this.emailService.sendQueued(item.id);
          if (result.isSuccess) {
            processed++;
          }
        } catch (error: any) {
          logger.error(`Failed to process scheduled email ${item.id}:`, error);
        }
      }

      return Result.ok(processed);
    } catch (error: any) {
      logger.error('EmailQueueService.processScheduled error:', error);
      return Result.fail(error);
    }
  }

  /**
   * Retry failed emails
   */
  async retryFailed(maxRetries: number = emailConfig.queue.maxRetries): Promise<Result<number>> {
    try {
      const supabase = getSupabaseAdminClient();

      // Get failed emails that haven't exceeded max retries
      const { data: queueItems, error } = await supabase
        .from('email_queue')
        .select('*')
        .eq('status', EmailStatus.FAILED)
        .lt('retry_count', maxRetries)
        .order('last_retry_at', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: true })
        .limit(emailConfig.queue.batchSize);

      if (error) {
        logger.error('EmailQueueService.retryFailed error:', error);
        return Result.fail(new Error(`Failed to fetch failed emails: ${error.message}`));
      }

      if (!queueItems || queueItems.length === 0) {
        return Result.ok(0);
      }

      let retried = 0;
      for (const item of queueItems) {
        try {
          // Check if enough time has passed since last retry
          const lastRetry = item.last_retry_at ? new Date(item.last_retry_at).getTime() : 0;
          const now = Date.now();
          const timeSinceLastRetry = now - lastRetry;

          if (timeSinceLastRetry < emailConfig.queue.retryDelay) {
            continue; // Skip if not enough time has passed
          }

          // Reset status to pending for retry
          await supabase
            .from('email_queue')
            .update({ status: EmailStatus.PENDING })
            .eq('id', item.id);

          const result = await this.emailService.sendQueued(item.id);
          if (result.isSuccess) {
            retried++;
          }
        } catch (error: any) {
          logger.error(`Failed to retry email ${item.id}:`, error);
        }
      }

      return Result.ok(retried);
    } catch (error: any) {
      logger.error('EmailQueueService.retryFailed error:', error);
      return Result.fail(error);
    }
  }

  /**
   * Get queue status
   */
  async getQueueStatus(): Promise<
    Result<{
      pending: number;
      queued: number;
      failed: number;
      scheduled: number;
    }>
  > {
    try {
      const supabase = getSupabaseAdminClient();

      const [pendingResult, queuedResult, failedResult, scheduledResult] = await Promise.all([
        supabase
          .from('email_queue')
          .select('id', { count: 'exact', head: true })
          .eq('status', EmailStatus.PENDING)
          .is('scheduled_at', null),
        supabase
          .from('email_queue')
          .select('id', { count: 'exact', head: true })
          .eq('status', EmailStatus.QUEUED),
        supabase
          .from('email_queue')
          .select('id', { count: 'exact', head: true })
          .eq('status', EmailStatus.FAILED),
        supabase
          .from('email_queue')
          .select('id', { count: 'exact', head: true })
          .eq('status', EmailStatus.PENDING)
          .not('scheduled_at', 'is', null),
      ]);

      return Result.ok({
        pending: pendingResult.count || 0,
        queued: queuedResult.count || 0,
        failed: failedResult.count || 0,
        scheduled: scheduledResult.count || 0,
      });
    } catch (error: any) {
      logger.error('EmailQueueService.getQueueStatus error:', error);
      return Result.fail(error);
    }
  }
}
