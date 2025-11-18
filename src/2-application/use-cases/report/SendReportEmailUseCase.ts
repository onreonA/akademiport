/**
 * Send Report Email Use Case
 *
 * Raporu email ile gönderir
 */

import { IProgressReportRepository } from '@/3-domain/interfaces/repositories/IProgressReportRepository';
import { IEmailService } from '@/3-domain/interfaces/services/IEmailService';
import { EmailTemplateService } from '@/5-shared/services/email/email-template.service';
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
  private emailTemplateService: EmailTemplateService;

  constructor(
    private reportRepository: IProgressReportRepository,
    private emailService: IEmailService
  ) {
    this.emailTemplateService = new EmailTemplateService();
  }

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

      // Prepare template variables
      const variables: Record<string, any> = {
        report_title: report.title,
        report_type: this.formatReportType(report.reportType),
        created_at: this.formatDate(report.createdAt),
        report_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/reports/${report.id}`,
      };

      // Add period if exists
      if (report.periodYear && report.periodMonth) {
        const monthNames = [
          'Ocak',
          'Şubat',
          'Mart',
          'Nisan',
          'Mayıs',
          'Haziran',
          'Temmuz',
          'Ağustos',
          'Eylül',
          'Ekim',
          'Kasım',
          'Aralık',
        ];
        variables.period = `${monthNames[report.periodMonth - 1]} ${report.periodYear}`;
      }

      // Add PDF URL if exists
      if (report.pdfUrl) {
        variables.pdf_url = report.pdfUrl;
      }

      // Add AI analysis if exists
      if (report.aiAnalysis) {
        variables.ai_analysis = true;
        variables.risk_score = report.aiAnalysis.riskScore;
        variables.success_probability = report.aiAnalysis.successProbability;
        if (report.aiAnalysis.summary) {
          variables.summary = report.aiAnalysis.summary;
        }
      } else {
        variables.ai_analysis = false;
      }

      // Render email template
      const templateResult = await this.emailTemplateService.renderTemplate(
        'report-completed',
        variables
      );

      if (templateResult.isFailure) {
        logger.error('Failed to render email template', { error: templateResult.error });
        return Result.fail(new AppError('Email template render edilemedi', 500));
      }

      const { html, text, subject } = templateResult.value;

      // Send email to all recipients
      const emailPromises = dto.recipients.map((recipient) =>
        this.emailService.send({
          to: recipient,
          subject: dto.subject || subject,
          html,
          text,
          metadata: {
            reportId: dto.reportId,
            reportType: report.reportType,
          },
        })
      );

      const emailResults = await Promise.allSettled(emailPromises);

      // Check if all emails were sent successfully
      const failedEmails = emailResults
        .map((result, index) => ({ result, email: dto.recipients[index] }))
        .filter(
          ({ result }) =>
            result.status === 'rejected' ||
            (result.status === 'fulfilled' && result.value.isFailure)
        );

      if (failedEmails.length > 0) {
        logger.warn('Some emails failed to send', {
          reportId: dto.reportId,
          failedEmails: failedEmails.map(({ email }) => email),
        });
      }

      // Mark as sent (even if some failed)
      await this.reportRepository.update(dto.reportId, {
        emailSent: true,
        emailSentAt: new Date(),
        emailRecipients: dto.recipients,
      });

      logger.info('Report email sent', {
        reportId: dto.reportId,
        recipients: dto.recipients,
        successCount: emailResults.length - failedEmails.length,
        failedCount: failedEmails.length,
      });

      return Result.ok(undefined);
    } catch (error) {
      logger.error('SendReportEmailUseCase error', { error, dto });
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Email gönderilemedi', 500)
      );
    }
  }

  /**
   * Rapor tipini formatla
   */
  private formatReportType(type: string): string {
    const types: Record<string, string> = {
      interim: 'Ara Rapor',
      monthly: 'Aylık Rapor',
      program: 'Program Raporu',
      company: 'Firma Raporu',
      ministry: 'Bakanlık Raporu',
    };
    return types[type] || type;
  }

  /**
   * Tarihi formatla
   */
  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
