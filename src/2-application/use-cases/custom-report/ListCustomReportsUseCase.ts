/**
 * List Custom Reports Use Case
 */

import { ICustomReportRepository } from '@/3-domain/interfaces/repositories/ICustomReportRepository';
import { CustomReportFilterDto, CustomReportEntity } from '@/3-domain/entities/CustomReport';
import { Result } from '@/6-core/result/Result';
import { logger } from '@/5-shared/utils/logger';

export interface ListCustomReportsResult {
  reports: CustomReportEntity[];
  total: number;
  page: number;
  limit: number;
}

export class ListCustomReportsUseCase {
  constructor(private customReportRepository: ICustomReportRepository) {}

  async execute(
    filter: CustomReportFilterDto,
    userId: string,
    isAdmin: boolean = false
  ): Promise<Result<ListCustomReportsResult>> {
    try {
      // If not admin, only show user's own reports
      if (!isAdmin) {
        filter.userId = userId;
      }

      const result = await this.customReportRepository.findWithFilters(filter);

      if (result.isFailure) {
        logger.error('List custom reports failed:', result.error);
        return Result.fail(result.error || "Custom report'lar alınamadı");
      }

      const page = filter.page || 1;
      const limit = filter.limit || 10;

      return Result.ok({
        reports: result.value.reports,
        total: result.value.total,
        page,
        limit,
      });
    } catch (error) {
      logger.error('ListCustomReportsUseCase error:', error);
      return Result.fail(error instanceof Error ? error.message : "Custom report'lar alınamadı");
    }
  }
}
