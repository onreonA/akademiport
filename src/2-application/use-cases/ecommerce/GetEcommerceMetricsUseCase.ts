import { IEcommerceRepository } from '@/3-domain/interfaces/repositories/IEcommerceRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { EcommerceMetricsFilterDto } from '@/2-application/dtos/ecommerce/EcommerceFilterDto';

export class GetEcommerceMetricsUseCase {
  constructor(private ecommerceRepository: IEcommerceRepository) {}

  async execute(filter: EcommerceMetricsFilterDto): Promise<
    Result<{
      metrics: any[];
      total: number;
    }>
  > {
    try {
      const metricsResult = await this.ecommerceRepository.listMetrics({
        companyId: filter.companyId,
        programId: filter.programId,
        periodYear: filter.periodYear,
        periodMonth: filter.periodMonth,
        platformType: filter.platformType,
        startDate: filter.startDate ? new Date(filter.startDate) : undefined,
        endDate: filter.endDate ? new Date(filter.endDate) : undefined,
        limit: filter.limit,
        offset: filter.offset,
      });

      if (metricsResult.isFailure) {
        const errorMessage =
          metricsResult.error instanceof Error
            ? metricsResult.error.message
            : metricsResult.error || 'Metrikler alınamadı';
        return Result.fail(new AppError(errorMessage, 500));
      }

      const countResult = await this.ecommerceRepository.countMetrics({
        companyId: filter.companyId,
        programId: filter.programId,
        periodYear: filter.periodYear,
        periodMonth: filter.periodMonth,
        platformType: filter.platformType,
        startDate: filter.startDate ? new Date(filter.startDate) : undefined,
        endDate: filter.endDate ? new Date(filter.endDate) : undefined,
      });

      if (countResult.isFailure) {
        const errorMessage =
          countResult.error instanceof Error
            ? countResult.error.message
            : countResult.error || 'Toplam sayı alınamadı';
        return Result.fail(new AppError(errorMessage, 500));
      }

      return Result.ok({
        metrics: metricsResult.value,
        total: countResult.value,
      });
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Metrikler alınamadı', 500)
      );
    }
  }
}
