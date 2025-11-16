import { EmailQueueItem } from '../../entities/Email';
import { EmailPriority } from '../../enums/EmailEnums';
import { Result } from '@/6-core/result/Result';

/**
 * Email Queue Service Interface
 */
export interface IEmailQueueService {
  /**
   * Add email to queue
   */
  enqueue(item: Partial<EmailQueueItem>): Promise<Result<string>>;

  /**
   * Process pending emails
   */
  processQueue(limit?: number): Promise<Result<number>>;

  /**
   * Process scheduled emails
   */
  processScheduled(): Promise<Result<number>>;

  /**
   * Retry failed emails
   */
  retryFailed(maxRetries?: number): Promise<Result<number>>;

  /**
   * Get queue status
   */
  getQueueStatus(): Promise<
    Result<{
      pending: number;
      queued: number;
      failed: number;
      scheduled: number;
    }>
  >;
}
