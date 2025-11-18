/**
 * Create Custom Report Use Case
 */

import { ICustomReportRepository } from '@/3-domain/interfaces/repositories/ICustomReportRepository';
import { CreateCustomReportDto, CustomReportEntity } from '@/3-domain/entities/CustomReport';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { logger } from '@/5-shared/utils/logger';

export class CreateCustomReportUseCase {
  constructor(private customReportRepository: ICustomReportRepository) {}

  async execute(dto: CreateCustomReportDto, userId: string): Promise<Result<CustomReportEntity>> {
    try {
      // Validation
      const validationErrors = CustomReportEntity.validate({
        name: dto.name,
        reportType: dto.reportType,
        selectedMetrics: dto.selectedMetrics,
        dateRangeType: dto.dateRangeType,
        dateRangeStart: dto.dateRangeStart,
        dateRangeEnd: dto.dateRangeEnd,
        isScheduled: dto.isScheduled,
        scheduleCron: dto.scheduleCron,
      });

      if (validationErrors.length > 0) {
        return Result.fail(new AppError(validationErrors.join(', '), 400));
      }

      // Create report
      const result = await this.customReportRepository.create(dto, userId);

      if (result.isFailure) {
        logger.error('Custom report creation failed:', result.error);
        return Result.fail(result.error || 'Custom report oluşturulamadı');
      }

      logger.info(`Custom report created: ${result.value.id}`);
      return Result.ok(result.value);
    } catch (error) {
      logger.error('CreateCustomReportUseCase error:', error);
      return Result.fail(error instanceof Error ? error.message : 'Custom report oluşturulamadı');
    }
  }
}
