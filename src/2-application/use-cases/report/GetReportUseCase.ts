/**
 * Get Report Use Case
 *
 * Tek bir raporu getirir
 */

import { IProgressReportRepository } from '@/3-domain/interfaces/repositories/IProgressReportRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

export class GetReportUseCase {
  constructor(private reportRepository: IProgressReportRepository) {}

  async execute(reportId: string): Promise<Result<any>> {
    try {
      const reportResult = await this.reportRepository.findById(reportId);

      if (reportResult.isFailure) {
        return Result.fail(reportResult.error || new AppError('Rapor bulunamadı', 500));
      }

      if (!reportResult.value) {
        return Result.fail(new AppError('Rapor bulunamadı', 404));
      }

      return Result.ok(reportResult.value);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Rapor getirilemedi', 500)
      );
    }
  }
}
