import { EmailLog } from '../../entities/Email';
import { Result } from '@/6-core/result/Result';

/**
 * Email Analytics Service Interface
 */
export interface IEmailAnalyticsService {
  /**
   * Track email open
   */
  trackOpen(sendgridMessageId: string, ip?: string, userAgent?: string): Promise<Result<void>>;

  /**
   * Track email click
   */
  trackClick(
    sendgridMessageId: string,
    url: string,
    ip?: string,
    userAgent?: string
  ): Promise<Result<void>>;

  /**
   * Track email bounce
   */
  trackBounce(sendgridMessageId: string, reason: string): Promise<Result<void>>;

  /**
   * Track spam report
   */
  trackSpamReport(sendgridMessageId: string): Promise<Result<void>>;

  /**
   * Track unsubscribe
   */
  trackUnsubscribe(sendgridMessageId: string, token?: string): Promise<Result<void>>;

  /**
   * Get email analytics
   */
  getAnalytics(filters?: {
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
  >;
}
