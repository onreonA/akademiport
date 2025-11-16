/**
 * Email Analytics Service
 *
 * Email tracking ve analitik
 */

import { IEmailAnalyticsService } from '@/3-domain/interfaces/services/IEmailAnalyticsService';
import { EmailStatus } from '@/3-domain/enums/EmailEnums';
import { Result } from '@/6-core/result/Result';
import { getSupabaseAdminClient } from '@/4-infrastructure/database/supabase-server';
import { logger } from '@/5-shared/utils/logger';

export class EmailAnalyticsService implements IEmailAnalyticsService {
  /**
   * Track email open
   */
  async trackOpen(
    sendgridMessageId: string,
    ip?: string,
    userAgent?: string
  ): Promise<Result<void>> {
    try {
      const supabase = getSupabaseAdminClient();

      // Find email log by sendgrid_message_id
      const { data: log, error: findError } = await supabase
        .from('email_logs')
        .select('*')
        .eq('sendgrid_message_id', sendgridMessageId)
        .single();

      if (findError || !log) {
        logger.warn(`Email log not found for message ID: ${sendgridMessageId}`);
        return Result.ok(undefined);
      }

      // Update log with open tracking
      const openedCount = (log.opened_count || 0) + 1;
      const updateData: any = {
        opened_count: openedCount,
        updated_at: new Date().toISOString(),
      };

      // Set first open time
      if (!log.opened_at) {
        updateData.opened_at = new Date().toISOString();
      }

      // Add metadata
      if (ip || userAgent) {
        updateData.metadata = {
          ...(log.metadata || {}),
          opens: [
            ...(log.metadata?.opens || []),
            {
              timestamp: new Date().toISOString(),
              ip,
              userAgent,
            },
          ],
        };
      }

      const { error: updateError } = await supabase
        .from('email_logs')
        .update(updateData)
        .eq('id', log.id);

      if (updateError) {
        logger.error('EmailAnalyticsService.trackOpen error:', updateError);
        return Result.fail(new Error(`Failed to track open: ${updateError.message}`));
      }

      return Result.ok(undefined);
    } catch (error: any) {
      logger.error('EmailAnalyticsService.trackOpen error:', error);
      return Result.fail(error);
    }
  }

  /**
   * Track email click
   */
  async trackClick(
    sendgridMessageId: string,
    url: string,
    ip?: string,
    userAgent?: string
  ): Promise<Result<void>> {
    try {
      const supabase = getSupabaseAdminClient();

      // Find email log by sendgrid_message_id
      const { data: log, error: findError } = await supabase
        .from('email_logs')
        .select('*')
        .eq('sendgrid_message_id', sendgridMessageId)
        .single();

      if (findError || !log) {
        logger.warn(`Email log not found for message ID: ${sendgridMessageId}`);
        return Result.ok(undefined);
      }

      // Update log with click tracking
      const clickedCount = (log.clicked_count || 0) + 1;
      const clickedLinks = log.clicked_links || [];
      if (!clickedLinks.includes(url)) {
        clickedLinks.push(url);
      }

      const updateData: any = {
        clicked_count: clickedCount,
        clicked_links: clickedLinks,
        updated_at: new Date().toISOString(),
      };

      // Set first click time
      if (!log.clicked_at) {
        updateData.clicked_at = new Date().toISOString();
      }

      // Add metadata
      if (ip || userAgent) {
        updateData.metadata = {
          ...(log.metadata || {}),
          clicks: [
            ...(log.metadata?.clicks || []),
            {
              timestamp: new Date().toISOString(),
              url,
              ip,
              userAgent,
            },
          ],
        };
      }

      const { error: updateError } = await supabase
        .from('email_logs')
        .update(updateData)
        .eq('id', log.id);

      if (updateError) {
        logger.error('EmailAnalyticsService.trackClick error:', updateError);
        return Result.fail(new Error(`Failed to track click: ${updateError.message}`));
      }

      return Result.ok(undefined);
    } catch (error: any) {
      logger.error('EmailAnalyticsService.trackClick error:', error);
      return Result.fail(error);
    }
  }

  /**
   * Track email bounce
   */
  async trackBounce(sendgridMessageId: string, reason: string): Promise<Result<void>> {
    try {
      const supabase = getSupabaseAdminClient();

      // Find email log by sendgrid_message_id
      const { data: log, error: findError } = await supabase
        .from('email_logs')
        .select('*')
        .eq('sendgrid_message_id', sendgridMessageId)
        .single();

      if (findError || !log) {
        logger.warn(`Email log not found for message ID: ${sendgridMessageId}`);
        return Result.ok(undefined);
      }

      // Update log with bounce tracking
      const { error: updateError } = await supabase
        .from('email_logs')
        .update({
          status: EmailStatus.BOUNCED,
          bounced_at: new Date().toISOString(),
          bounce_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', log.id);

      if (updateError) {
        logger.error('EmailAnalyticsService.trackBounce error:', updateError);
        return Result.fail(new Error(`Failed to track bounce: ${updateError.message}`));
      }

      return Result.ok(undefined);
    } catch (error: any) {
      logger.error('EmailAnalyticsService.trackBounce error:', error);
      return Result.fail(error);
    }
  }

  /**
   * Track spam report
   */
  async trackSpamReport(sendgridMessageId: string): Promise<Result<void>> {
    try {
      const supabase = getSupabaseAdminClient();

      // Find email log by sendgrid_message_id
      const { data: log, error: findError } = await supabase
        .from('email_logs')
        .select('*')
        .eq('sendgrid_message_id', sendgridMessageId)
        .single();

      if (findError || !log) {
        logger.warn(`Email log not found for message ID: ${sendgridMessageId}`);
        return Result.ok(undefined);
      }

      // Update log with spam report tracking
      const { error: updateError } = await supabase
        .from('email_logs')
        .update({
          status: EmailStatus.SPAM_REPORTED,
          spam_reported_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', log.id);

      if (updateError) {
        logger.error('EmailAnalyticsService.trackSpamReport error:', updateError);
        return Result.fail(new Error(`Failed to track spam report: ${updateError.message}`));
      }

      return Result.ok(undefined);
    } catch (error: any) {
      logger.error('EmailAnalyticsService.trackSpamReport error:', error);
      return Result.fail(error);
    }
  }

  /**
   * Track unsubscribe
   */
  async trackUnsubscribe(sendgridMessageId: string, token?: string): Promise<Result<void>> {
    try {
      const supabase = getSupabaseAdminClient();

      // Find email log by sendgrid_message_id
      const { data: log, error: findError } = await supabase
        .from('email_logs')
        .select('*')
        .eq('sendgrid_message_id', sendgridMessageId)
        .single();

      if (findError || !log) {
        logger.warn(`Email log not found for message ID: ${sendgridMessageId}`);
        return Result.ok(undefined);
      }

      // Update log with unsubscribe tracking
      const { error: updateError } = await supabase
        .from('email_logs')
        .update({
          status: EmailStatus.UNSUBSCRIBED,
          unsubscribed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', log.id);

      if (updateError) {
        logger.error('EmailAnalyticsService.trackUnsubscribe error:', updateError);
        return Result.fail(new Error(`Failed to track unsubscribe: ${updateError.message}`));
      }

      // If token provided, also update email_preferences
      if (token) {
        await supabase
          .from('email_preferences')
          .update({
            unsubscribed_at: new Date().toISOString(),
            receive_marketing: false,
            receive_notifications: false,
          })
          .eq('unsubscribe_token', token);
      }

      return Result.ok(undefined);
    } catch (error: any) {
      logger.error('EmailAnalyticsService.trackUnsubscribe error:', error);
      return Result.fail(error);
    }
  }

  /**
   * Get email analytics
   */
  async getAnalytics(filters?: {
    startDate?: Date;
    endDate?: Date;
    emailType?: string;
    status?: string;
  }): Promise<
    Result<{
      totalSent: number;
      totalOpened: number;
      totalClicked: number;
      openRate: number;
      clickRate: number;
      bounceRate: number;
      spamRate: number;
    }>
  > {
    try {
      const supabase = getSupabaseAdminClient();

      let query = supabase.from('email_logs').select('*', { count: 'exact' });

      // Apply filters
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data: logs, error, count } = await query;

      if (error) {
        logger.error('EmailAnalyticsService.getAnalytics error:', error);
        return Result.fail(new Error(`Failed to get analytics: ${error.message}`));
      }

      const totalSent = count || 0;
      const totalOpened = logs?.filter((log) => log.opened_at).length || 0;
      const totalClicked = logs?.filter((log) => log.clicked_at).length || 0;
      const totalBounced = logs?.filter((log) => log.status === EmailStatus.BOUNCED).length || 0;
      const totalSpam = logs?.filter((log) => log.status === EmailStatus.SPAM_REPORTED).length || 0;

      return Result.ok({
        totalSent,
        totalOpened,
        totalClicked,
        openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
        clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
        bounceRate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0,
        spamRate: totalSent > 0 ? (totalSpam / totalSent) * 100 : 0,
      });
    } catch (error: any) {
      logger.error('EmailAnalyticsService.getAnalytics error:', error);
      return Result.fail(error);
    }
  }
}
