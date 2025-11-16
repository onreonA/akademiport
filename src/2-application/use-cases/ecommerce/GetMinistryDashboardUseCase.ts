import { IEcommerceRepository } from '@/3-domain/interfaces/repositories/IEcommerceRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

export class GetMinistryDashboardUseCase {
  constructor(private ecommerceRepository: IEcommerceRepository) {}

  async execute(programId?: string): Promise<
    Result<{
      totalCompanies: number;
      totalRevenue: number;
      avgRevenue: number;
      totalOrders: number;
      totalVisitors: number;
      growthRate: number;
      topCompanies: any[];
      platformDistribution: {
        platform: string;
        revenue: number;
        companies: number;
      }[];
    }>
  > {
    try {
      const result = await this.ecommerceRepository.getMinistryDashboard(programId);

      if (result.isFailure) {
        const errorMessage =
          result.error instanceof Error
            ? result.error.message
            : result.error || 'Dashboard verileri alınamadı';
        return Result.fail(new AppError(errorMessage, 500));
      }

      return Result.ok(result.value);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Dashboard verileri alınamadı', 500)
      );
    }
  }
}
