/**
 * Update Custom Report Use Case
 */

import { ICustomReportRepository } from '@/3-domain/interfaces/repositories/ICustomReportRepository';
import {
  UpdateCustomReportDto,
  CustomReport,
  CustomReportEntity,
} from '@/3-domain/entities/CustomReport';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { logger } from '@/5-shared/utils/logger';

export class UpdateCustomReportUseCase {
  constructor(private customReportRepository: ICustomReportRepository) {}

  async execute(
    id: string,
    dto: UpdateCustomReportDto,
    userId: string
  ): Promise<Result<CustomReportEntity>> {
    try {
      // Get existing report
      const existingResult = await this.customReportRepository.findById(id);

      if (existingResult.isFailure) {
        return Result.fail(new AppError('Custom report bulunamadı', 404));
      }

      const existing = existingResult.value;
      if (!existing) {
        return Result.fail(new AppError('Custom report bulunamadı', 404));
      }

      // Check ownership
      if (existing.userId !== userId) {
        return Result.fail(new AppError('Bu raporu güncelleme yetkiniz yok', 403));
      }

      // Validation (only validate changed fields)
      const validationData: Partial<CustomReportEntity> = {
        name: dto.name ?? existing.name,
        reportType: dto.reportType ?? existing.reportType,
        selectedMetrics: dto.selectedMetrics ?? existing.selectedMetrics,
        dateRangeType: dto.dateRangeType ?? existing.dateRangeType,
        dateRangeStart: dto.dateRangeStart ?? existing.dateRangeStart,
        dateRangeEnd: dto.dateRangeEnd ?? existing.dateRangeEnd,
        isScheduled: dto.isScheduled ?? existing.isScheduled,
        scheduleCron: dto.scheduleCron ?? existing.scheduleCron,
      };

      const validationErrors = CustomReportEntity.validate(validationData);

      if (validationErrors.length > 0) {
        return Result.fail(new AppError(validationErrors.join(', '), 400));
      }

      // Update report
      const result = await this.customReportRepository.update(id, dto);

      if (result.isFailure) {
        logger.error('Custom report update failed:', result.error);
        return Result.fail(result.error || 'Custom report güncellenemedi');
      }

      logger.info(`Custom report updated: ${id}`);
      // Convert CustomReport to CustomReportEntity
      const reportEntity = new CustomReportEntity(result.value);
      return Result.ok(reportEntity);
    } catch (error) {
      logger.error('UpdateCustomReportUseCase error:', error);
      return Result.fail(error instanceof Error ? error.message : 'Custom report güncellenemedi');
    }
  }
}
