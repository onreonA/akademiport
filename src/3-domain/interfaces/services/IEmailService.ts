import { EmailSendOptions, EmailSendResult } from '../../entities/Email';
import { Result } from '@/6-core/result/Result';

/**
 * Email Service Interface
 */
export interface IEmailService {
  /**
   * Send email directly (synchronous)
   */
  send(options: EmailSendOptions): Promise<Result<EmailSendResult>>;

  /**
   * Send email using template
   */
  sendTemplate(
    templateName: string,
    to: string | string[],
    variables: Record<string, any>,
    options?: Partial<EmailSendOptions>
  ): Promise<Result<EmailSendResult>>;

  /**
   * Queue email for later sending
   */
  queue(options: EmailSendOptions): Promise<Result<string>>;

  /**
   * Send queued email
   */
  sendQueued(queueId: string): Promise<Result<EmailSendResult>>;
}
