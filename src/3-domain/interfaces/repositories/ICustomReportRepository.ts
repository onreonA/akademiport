/**
 * CustomReport Repository Interface
 */

import { Result } from '@/6-core/result/Result';
import {
  CustomReport,
  CreateCustomReportDto,
  UpdateCustomReportDto,
  CustomReportFilterDto,
} from '@/3-domain/entities/CustomReport';

export interface ICustomReportRepository {
  /**
   * Custom report oluştur
   */
  create(dto: CreateCustomReportDto, userId: string): Promise<Result<CustomReport>>;

  /**
   * Custom report güncelle
   */
  update(id: string, dto: UpdateCustomReportDto): Promise<Result<CustomReport>>;

  /**
   * Custom report sil
   */
  delete(id: string): Promise<Result<void>>;

  /**
   * Custom report bul (ID ile)
   */
  findById(id: string): Promise<Result<CustomReport | null>>;

  /**
   * Custom report'ları listele (filtrelerle)
   */
  findWithFilters(
    filter: CustomReportFilterDto
  ): Promise<Result<{ reports: CustomReport[]; total: number }>>;

  /**
   * Kullanıcının custom report'larını bul
   */
  findByUserId(userId: string): Promise<Result<CustomReport[]>>;

  /**
   * Zamanlanmış report'ları bul (cron job için)
   */
  findScheduledReports(): Promise<Result<CustomReport[]>>;

  /**
   * Sonraki generation zamanı gelmiş report'ları bul
   */
  findReportsToGenerate(): Promise<Result<CustomReport[]>>;

  /**
   * Report'un generation zamanını güncelle
   */
  updateGenerationTime(
    id: string,
    lastGeneratedAt: Date,
    nextGenerationAt: Date | null
  ): Promise<Result<void>>;
}
