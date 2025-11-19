/**
 * Create Custom Report Use Case
 */

import { ICustomReportRepository } from '@/3-domain/interfaces/repositories/ICustomReportRepository';
import { CreateCustomReportDto, CustomReport } from '@/3-domain/entities/CustomReport';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { logger } from '@/5-shared/utils/logger';

export class CreateCustomReportUseCase {
  constructor(private customReportRepository: ICustomReportRepository) {}

  async execute(dto: CreateCustomReportDto, userId: string): Promise<Result<CustomReport>> {
    try {
      // Basic validation
      if (!dto.name || dto.name.trim().length === 0) {
        return Result.fail(new AppError('Rapor adı gereklidir', 400));
      }

      if (!dto.reportType) {
        return Result.fail(new AppError('Rapor tipi gereklidir', 400));
      }

      if (!dto.selectedMetrics || dto.selectedMetrics.length === 0) {
        return Result.fail(new AppError('En az bir metrik seçilmelidir', 400));
      }

      if (dto.dateRangeType === 'custom' && (!dto.dateRangeStart || !dto.dateRangeEnd)) {
        return Result.fail(
          new AppError('Özel tarih aralığı için başlangıç ve bitiş tarihi gereklidir', 400)
        );
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
