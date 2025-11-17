/**
 * IProgressReportRepository Interface
 * Progress report repository interface
 */

import { Result } from '@/6-core/result/Result';
import {
  ProgressReport,
  CreateProgressReportDto,
  UpdateProgressReportDto,
  ReportType,
  ReportStatus,
} from '@/3-domain/entities/ProgressReport';

export interface IProgressReportRepository {
  /**
   * Rapor oluştur
   */
  create(dto: CreateProgressReportDto): Promise<Result<ProgressReport>>;

  /**
   * Rapor güncelle
   */
  update(id: string, dto: UpdateProgressReportDto): Promise<Result<ProgressReport>>;

  /**
   * Rapor getir
   */
  findById(id: string): Promise<Result<ProgressReport | null>>;

  /**
   * Raporları listele
   */
  findMany(filters?: {
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
  }): Promise<Result<ProgressReport[]>>;

  /**
   * Firma raporlarını getir
   */
  findByCompany(
    companyId: string,
    filters?: {
      reportType?: ReportType;
      status?: ReportStatus;
      limit?: number;
      offset?: number;
    }
  ): Promise<Result<ProgressReport[]>>;

  /**
   * Program raporlarını getir
   */
  findByProgram(
    programId: string,
    filters?: {
      reportType?: ReportType;
      status?: ReportStatus;
      limit?: number;
      offset?: number;
    }
  ): Promise<Result<ProgressReport[]>>;

  /**
   * Proje raporlarını getir
   */
  findByProject(
    projectId: string,
    filters?: {
      reportType?: ReportType;
      status?: ReportStatus;
      limit?: number;
      offset?: number;
    }
  ): Promise<Result<ProgressReport[]>>;

  /**
   * Alt proje raporlarını getir
   */
  findBySubProject(
    subProjectId: string,
    filters?: {
      reportType?: ReportType;
      status?: ReportStatus;
      limit?: number;
      offset?: number;
    }
  ): Promise<Result<ProgressReport[]>>;

  /**
   * Aylık rapor var mı kontrol et
   */
  existsMonthlyReport(
    companyId: string,
    programId: string,
    periodYear: number,
    periodMonth: number
  ): Promise<Result<boolean>>;

  /**
   * Rapor sil
   */
  delete(id: string): Promise<Result<void>>;

  /**
   * Rapor sayısını getir
   */
  count(filters?: {
    companyId?: string;
    programId?: string;
    reportType?: ReportType;
    status?: ReportStatus;
  }): Promise<Result<number>>;
}
