/**
 * Delete Custom Report Use Case
 */

import { ICustomReportRepository } from '@/3-domain/interfaces/repositories/ICustomReportRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { logger } from '@/5-shared/utils/logger';

export class DeleteCustomReportUseCase {
  constructor(private customReportRepository: ICustomReportRepository) {}

  async execute(id: string, userId: string): Promise<Result<void>> {
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
        return Result.fail(new AppError('Bu raporu silme yetkiniz yok', 403));
      }

      // Delete report
      const result = await this.customReportRepository.delete(id);

      if (result.isFailure) {
        logger.error('Custom report deletion failed:', result.error);
        return Result.fail(result.error || 'Custom report silinemedi');
      }

      logger.info(`Custom report deleted: ${id}`);
      return Result.ok(undefined);
    } catch (error) {
      logger.error('DeleteCustomReportUseCase error:', error);
      return Result.fail(error instanceof Error ? error.message : 'Custom report silinemedi');
    }
  }
}
