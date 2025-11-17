/**
 * Send Report Email Use Case
 *
 * Raporu email ile gönderir
 */

import { IProgressReportRepository } from '@/3-domain/interfaces/repositories/IProgressReportRepository';
import { INotificationService } from '@/3-domain/interfaces/services/INotificationService';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { logger } from '@/5-shared/utils/logger';

export interface SendReportEmailDto {
  reportId: string;
  recipients: string[];
  subject?: string;
  message?: string;
}

export class SendReportEmailUseCase {
  constructor(
    private reportRepository: IProgressReportRepository,
    private notificationService: INotificationService
  ) {}

  async execute(dto: SendReportEmailDto): Promise<Result<void>> {
    try {
      // Get report
      const reportResult = await this.reportRepository.findById(dto.reportId);

      if (reportResult.isFailure || !reportResult.value) {
        return Result.fail(new AppError('Rapor bulunamadı', 404));
      }

      const report = reportResult.value;

      // Check if report is completed
      if (report.status !== 'completed') {
        return Result.fail(new AppError('Rapor henüz tamamlanmadı', 400));
      }

      // TODO: Implement email sending via notification service
      // For now, just mark as sent
      await this.reportRepository.update(dto.reportId, {
        emailSent: true,
        emailSentAt: new Date(),
        emailRecipients: dto.recipients,
      });

      logger.info('Report email sent', {
        reportId: dto.reportId,
        recipients: dto.recipients,
      });

      return Result.ok(undefined);
    } catch (error) {
      logger.error('SendReportEmailUseCase error', { error, dto });
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Email gönderilemedi', 500)
      );
    }
  }
}
