import { IEcommerceRepository } from '@/3-domain/interfaces/repositories/IEcommerceRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { EcommercePerformanceFilterDto } from '@/2-application/dtos/ecommerce/EcommerceFilterDto';

export class GetEcommercePerformanceUseCase {
  constructor(private ecommerceRepository: IEcommerceRepository) {}

  async execute(filter: EcommercePerformanceFilterDto): Promise<Result<any[]>> {
    try {
      const result = await this.ecommerceRepository.getPerformance({
        programId: filter.programId,
        companyId: filter.companyId,
        minRevenue: filter.minRevenue,
        limit: filter.limit,
        offset: filter.offset,
      });

      if (result.isFailure) {
        const errorMessage =
          result.error instanceof Error
            ? result.error.message
            : result.error || 'Performans verileri alınamadı';
        return Result.fail(new AppError(errorMessage, 500));
      }

      return Result.ok(result.value);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Performans verileri alınamadı', 500)
      );
    }
  }
}
