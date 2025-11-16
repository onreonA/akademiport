import { IEcommerceRepository } from '@/3-domain/interfaces/repositories/IEcommerceRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { CreateEcommerceMetricsDto } from '@/2-application/dtos/ecommerce/CreateEcommerceMetricsDto';
import { EcommerceMetricsEntity } from '@/3-domain/entities/Ecommerce';

export class CreateEcommerceMetricsUseCase {
  constructor(private ecommerceRepository: IEcommerceRepository) {}

  async execute(data: CreateEcommerceMetricsDto, userId: string): Promise<Result<{ id: string }>> {
    try {
      // Validation
      const validationErrors = EcommerceMetricsEntity.validate({
        companyId: data.companyId,
        programId: data.programId,
        periodYear: data.periodYear,
        periodMonth: data.periodMonth,
        platformType: data.platformType,
        alibabaVisitors: data.alibabaVisitors ?? 0,
        alibabaProducts: data.alibabaProducts ?? 0,
        alibabaRfqCount: data.alibabaRfqCount ?? 0,
        alibabaOrders: data.alibabaOrders ?? 0,
        alibabaRevenue: data.alibabaRevenue ?? 0,
        b2cVisitors: data.b2cVisitors ?? 0,
        b2cProducts: data.b2cProducts ?? 0,
        b2cOrders: data.b2cOrders ?? 0,
        b2cRevenue: data.b2cRevenue ?? 0,
      });

      if (validationErrors.length > 0) {
        return Result.fail(new AppError(validationErrors.join(', '), 400));
      }

      // Check if metrics already exist for this period
      const existingResult = await this.ecommerceRepository.findMetricsByCompanyAndPeriod(
        data.companyId,
        data.programId,
        data.periodYear,
        data.periodMonth,
        data.platformType
      );

      if (existingResult.isSuccess && existingResult.value) {
        return Result.fail(
          new AppError(
            "Bu dönem için bu platform tipinde zaten metrik kaydı mevcut. Güncelleme yapmak için update endpoint'ini kullanın.",
            400
          )
        );
      }

      // Create metrics
      const result = await this.ecommerceRepository.createMetrics({
        companyId: data.companyId,
        programId: data.programId,
        periodYear: data.periodYear,
        periodMonth: data.periodMonth,
        platformType: data.platformType,
        alibabaVisitors: data.alibabaVisitors ?? 0,
        alibabaProducts: data.alibabaProducts ?? 0,
        alibabaRfqCount: data.alibabaRfqCount ?? 0,
        alibabaOrders: data.alibabaOrders ?? 0,
        alibabaRevenue: data.alibabaRevenue ?? 0,
        b2cVisitors: data.b2cVisitors ?? 0,
        b2cProducts: data.b2cProducts ?? 0,
        b2cOrders: data.b2cOrders ?? 0,
        b2cRevenue: data.b2cRevenue ?? 0,
        notes: data.notes ?? null,
        metadata: data.metadata ?? null,
        createdBy: userId,
      });

      if (result.isFailure) {
        const errorMessage =
          result.error instanceof Error
            ? result.error.message
            : result.error || 'Metrik oluşturulamadı';
        return Result.fail(new AppError(errorMessage, 500));
      }

      // Refresh performance view (async)
      this.ecommerceRepository.refreshPerformance().catch((error) => {
        console.error('Failed to refresh ecommerce performance:', error);
      });

      return Result.ok({ id: result.value.id });
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Metrik oluşturulamadı', 500)
      );
    }
  }
}
