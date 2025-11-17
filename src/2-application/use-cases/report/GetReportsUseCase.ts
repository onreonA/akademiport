/**
 * Get Reports Use Case
 *
 * Raporları listeler ve filtreler
 */

import { IProgressReportRepository } from '@/3-domain/interfaces/repositories/IProgressReportRepository';
import { ReportType, ReportStatus } from '@/3-domain/entities/ProgressReport';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

export interface GetReportsDto {
  companyId?: string;
  programId?: string;
  projectId?: string;
  subProjectId?: string;
  consultantId?: string;
  reportType?: ReportType;
  status?: ReportStatus;
  periodYear?: number;
  periodMonth?: number;
  limit?: number;
  offset?: number;
}

export class GetReportsUseCase {
  constructor(private reportRepository: IProgressReportRepository) {}

  async execute(dto: GetReportsDto): Promise<Result<{ reports: any[]; total: number }>> {
    try {
      const reportsResult = await this.reportRepository.findMany({
        companyId: dto.companyId,
        programId: dto.programId,
        projectId: dto.projectId,
        subProjectId: dto.subProjectId,
        consultantId: dto.consultantId,
        reportType: dto.reportType,
        status: dto.status,
        periodYear: dto.periodYear,
        periodMonth: dto.periodMonth,
        limit: dto.limit || 50,
        offset: dto.offset || 0,
      });

      if (reportsResult.isFailure) {
        return Result.fail(reportsResult.error || new AppError('Raporlar listelenemedi', 500));
      }

      const countResult = await this.reportRepository.count({
        companyId: dto.companyId,
        programId: dto.programId,
        reportType: dto.reportType,
        status: dto.status,
      });

      const total = countResult.isSuccess ? countResult.value : reportsResult.value.length;

      return Result.ok({
        reports: reportsResult.value,
        total,
      });
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Raporlar listelenemedi', 500)
      );
    }
  }
}
