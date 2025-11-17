/**
 * IReportTemplateRepository Interface
 * Report template repository interface
 */

import { Result } from '@/6-core/result/Result';
import {
  ReportTemplate,
  CreateReportTemplateDto,
  UpdateReportTemplateDto,
  ReportType,
} from '@/3-domain/entities/ReportTemplate';

export interface IReportTemplateRepository {
  /**
   * Template oluştur
   */
  create(dto: CreateReportTemplateDto): Promise<Result<ReportTemplate>>;

  /**
   * Template güncelle
   */
  update(id: string, dto: UpdateReportTemplateDto): Promise<Result<ReportTemplate>>;

  /**
   * Template getir
   */
  findById(id: string): Promise<Result<ReportTemplate | null>>;

  /**
   * Aktif template'i rapor tipine göre getir
   */
  findActiveByType(reportType: ReportType): Promise<Result<ReportTemplate | null>>;

  /**
   * Template'leri listele
   */
  findMany(filters?: {
    reportType?: ReportType;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Result<ReportTemplate[]>>;

  /**
   * Rapor tipine göre template'leri getir
   */
  findByType(
    reportType: ReportType,
    filters?: {
      isActive?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<Result<ReportTemplate[]>>;

  /**
   * Template sil
   */
  delete(id: string): Promise<Result<void>>;

  /**
   * Template sayısını getir
   */
  count(filters?: { reportType?: ReportType; isActive?: boolean }): Promise<Result<number>>;
}
