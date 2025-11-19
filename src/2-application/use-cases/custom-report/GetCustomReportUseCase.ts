/**
 * Get Custom Report Use Case
 */

import { ICustomReportRepository } from '@/3-domain/interfaces/repositories/ICustomReportRepository';
import { CustomReport, CustomReportEntity } from '@/3-domain/entities/CustomReport';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { logger } from '@/5-shared/utils/logger';

export class GetCustomReportUseCase {
  constructor(private customReportRepository: ICustomReportRepository) {}

  async execute(
    id: string,
    userId: string,
    isAdmin: boolean = false
  ): Promise<Result<CustomReportEntity>> {
    try {
      const result = await this.customReportRepository.findById(id);

      if (result.isFailure) {
        return Result.fail(new AppError('Custom report bulunamadı', 404));
      }

      const report = result.value;
      if (!report) {
        return Result.fail(new AppError('Custom report bulunamadı', 404));
      }

      // Check access (user can only view their own reports unless admin)
      if (!isAdmin && report.userId !== userId) {
        return Result.fail(new AppError('Bu raporu görüntüleme yetkiniz yok', 403));
      }

      // Convert CustomReport to CustomReportEntity
      const reportEntity = new CustomReportEntity(report);
      return Result.ok(reportEntity);
    } catch (error) {
      logger.error('GetCustomReportUseCase error:', error);
      return Result.fail(error instanceof Error ? error.message : 'Custom report alınamadı');
    }
  }
}
