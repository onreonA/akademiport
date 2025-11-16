import { IEcommerceRepository } from '@/3-domain/interfaces/repositories/IEcommerceRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { UpdateEcommerceMetricsDto } from '@/2-application/dtos/ecommerce/UpdateEcommerceMetricsDto';

export class UpdateEcommerceMetricsUseCase {
  constructor(private ecommerceRepository: IEcommerceRepository) {}

  async execute(id: string, data: UpdateEcommerceMetricsDto): Promise<Result<{ id: string }>> {
    try {
      // Check if metrics exist
      const existingResult = await this.ecommerceRepository.findMetricsById(id);
      if (existingResult.isFailure || !existingResult.value) {
        return Result.fail(new AppError('Metrik bulunamadı', 404));
      }

      // Update metrics
      const result = await this.ecommerceRepository.updateMetrics(id, data);

      if (result.isFailure) {
        const errorMessage =
          result.error instanceof Error
            ? result.error.message
            : result.error || 'Metrik güncellenemedi';
        return Result.fail(new AppError(errorMessage, 500));
      }

      // Refresh performance view (async)
      this.ecommerceRepository.refreshPerformance().catch((error) => {
        console.error('Failed to refresh ecommerce performance:', error);
      });

      return Result.ok({ id: result.value.id });
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Metrik güncellenemedi', 500)
      );
    }
  }
}
