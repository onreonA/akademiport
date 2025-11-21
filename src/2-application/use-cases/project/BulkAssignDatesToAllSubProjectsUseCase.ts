import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { ISubProjectRepository } from '@/3-domain/interfaces/repositories/ISubProjectRepository';
import { ICompanyProjectAssignmentRepository } from '@/3-domain/interfaces/repositories/ICompanyProjectAssignmentRepository';
import { UpdateCompanyProjectAssignmentDto } from '@/3-domain/entities/CompanyProjectAssignment';

export interface BulkAllSubProjectsDateUpdateRequestDTO {
  projectId: string;
  dates: Array<{
    companyId: string;
    subProjectId: string;
    startDate?: Date | null;
    endDate?: Date | null;
  }>;
}

export interface BulkAllSubProjectsDateUpdateResultDTO {
  updatedCount: number;
  errors: Array<{
    companyId?: string;
    subProjectId?: string;
    error?: string;
    message?: string;
  }>;
}

/**
 * BulkAssignDatesToAllSubProjectsUseCase
 * Tüm alt projeler için firma bazlı tarih ataması yapar
 */
export class BulkAssignDatesToAllSubProjectsUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly subProjectRepository: ISubProjectRepository,
    private readonly assignmentRepository: ICompanyProjectAssignmentRepository
  ) {}

  async execute(
    request: BulkAllSubProjectsDateUpdateRequestDTO
  ): Promise<Result<BulkAllSubProjectsDateUpdateResultDTO>> {
    try {
      const { projectId, dates } = request;

      if (!projectId || projectId.trim().length === 0) {
        return Result.fail(new AppError('Proje bilgisi eksik', 400, 'PROJECT_ID_MISSING'));
      }

      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        return Result.fail(new AppError('Proje bulunamadı', 404, 'PROJECT_NOT_FOUND'));
      }

      const subProjects = await this.subProjectRepository.findByProjectId(projectId);
      const validSubProjectIds = new Set(subProjects.map((sp) => sp.id));

      const errors: BulkAllSubProjectsDateUpdateResultDTO['errors'] = [];
      const updates: Array<{ id: string; data: UpdateCompanyProjectAssignmentDto }> = [];

      for (const item of dates) {
        const companyId = item.companyId?.trim();
        const subProjectId = item.subProjectId?.trim();

        if (!companyId) {
          errors.push({ companyId: 'unknown', message: 'Firma bilgisi eksik' });
          continue;
        }

        if (!subProjectId) {
          errors.push({ companyId, message: 'Alt proje bilgisi eksik' });
          continue;
        }

        if (!validSubProjectIds.has(subProjectId)) {
          errors.push({
            companyId,
            subProjectId,
            message: 'Alt proje bu projeye ait değil',
          });
          continue;
        }

        // Mevcut atamayı bul
        const assignments = await this.assignmentRepository.findBySubProject(subProjectId);
        const assignment = assignments.find((a) => a.companyId === companyId);

        if (!assignment) {
          errors.push({
            companyId,
            subProjectId,
            message: 'Firma bu alt projeye atanmış değil',
          });
          continue;
        }

        // Tarih validasyonu
        const startDate = item.startDate ? new Date(item.startDate) : null;
        const endDate = item.endDate ? new Date(item.endDate) : null;

        if (startDate && endDate && startDate > endDate) {
          errors.push({
            companyId,
            subProjectId,
            message: 'Başlangıç tarihi bitiş tarihinden sonra olamaz',
          });
          continue;
        }

        const updateData: UpdateCompanyProjectAssignmentDto = {};
        if (item.startDate !== undefined) {
          updateData.startDate = startDate;
        }
        if (item.endDate !== undefined) {
          updateData.endDate = endDate;
        }

        if (Object.keys(updateData).length === 0) {
          continue;
        }

        updates.push({ id: assignment.id, data: updateData });
      }

      let updatedCount = 0;

      if (updates.length > 0) {
        try {
          const updatedAssignments = await this.assignmentRepository.updateMany(updates);
          updatedCount = updatedAssignments.length;
        } catch (error) {
          console.error('[BulkAssignDatesToAllSubProjectsUseCase] updateMany failed:', error);
          errors.push({
            message: 'Tarih güncellemesi sırasında bir hata oluştu',
          });
        }
      }

      return Result.ok({
        updatedCount,
        errors,
      });
    } catch (error) {
      console.error('[BulkAssignDatesToAllSubProjectsUseCase] Error:', error);
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Toplu tarih güncelleme işlemi tamamlanamadı',
          500,
          'BULK_ASSIGN_DATES_FAILED'
        )
      );
    }
  }
}
