import { Result } from '@/core/result';
import { AppError } from '@/core/errors';
import { IProjectRepository } from '@/domain/interfaces/repositories/IProjectRepository';
import { ISubProjectRepository } from '@/domain/interfaces/repositories/ISubProjectRepository';
import { ICompanyProjectAssignmentRepository } from '@/domain/interfaces/repositories/ICompanyProjectAssignmentRepository';
import {
  BulkDateUpdateRequestDTO,
  BulkDateUpdateResultDTO,
} from '@/application/dto/project-assignment.dto';
import { UpdateCompanyProjectAssignmentDto } from '@/domain/entities/CompanyProjectAssignment';

/**
 * BulkAssignDatesToCompanySubProjectsUseCase
 * Sprint 8 Extension: Firma bazlı tarih yönetimi
 */
export class BulkAssignDatesToCompanySubProjectsUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly subProjectRepository: ISubProjectRepository,
    private readonly assignmentRepository: ICompanyProjectAssignmentRepository
  ) {}

  async execute(request: BulkDateUpdateRequestDTO): Promise<Result<BulkDateUpdateResultDTO>> {
    try {
      const { projectId, subProjectId, dates } = request;

      if (!projectId || projectId.trim().length === 0) {
        return Result.fail(new AppError('Proje bilgisi eksik', 400, 'PROJECT_ID_MISSING'));
      }

      if (!subProjectId || subProjectId.trim().length === 0) {
        return Result.fail(new AppError('Alt proje bilgisi eksik', 400, 'SUBPROJECT_ID_MISSING'));
      }

      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        return Result.fail(new AppError('Proje bulunamadı', 404, 'PROJECT_NOT_FOUND'));
      }

      const subProject = await this.subProjectRepository.findById(subProjectId);
      if (!subProject || subProject.projectId !== projectId) {
        return Result.fail(
          new AppError('Alt proje bu projeye ait değil', 400, 'SUBPROJECT_NOT_IN_PROJECT')
        );
      }

      const assignments = await this.assignmentRepository.findBySubProject(subProjectId);
      const assignmentByCompany = new Map(
        assignments.map((assignment) => [assignment.companyId, assignment])
      );

      const errors: BulkDateUpdateResultDTO['errors'] = [];
      const updates: Array<{ id: string; data: UpdateCompanyProjectAssignmentDto }> = [];

      for (const item of dates) {
        const companyId = item.companyId?.trim();
        if (!companyId) {
          errors.push({ companyId: 'unknown', message: 'Firma bilgisi eksik' });
          continue;
        }

        const assignment = assignmentByCompany.get(companyId);
        if (!assignment) {
          errors.push({ companyId, message: 'Firma bu alt projeye atanmış değil' });
          continue;
        }

        const hasStart = Object.prototype.hasOwnProperty.call(item, 'startDate');
        const hasEnd = Object.prototype.hasOwnProperty.call(item, 'endDate');

        if (!hasStart && !hasEnd) {
          errors.push({ companyId, message: 'Güncellenecek tarih bilgisi bulunamadı' });
          continue;
        }

        const updateData: UpdateCompanyProjectAssignmentDto = {};
        let nextStart = assignment.startDate ?? null;
        let nextEnd = assignment.endDate ?? null;

        if (hasStart) {
          const incoming = item.startDate;
          if (!incoming) {
            updateData.startDate = null;
            nextStart = null;
          } else {
            const parsed = new Date(incoming);
            if (Number.isNaN(parsed.getTime())) {
              errors.push({ companyId, message: 'Başlangıç tarihi geçersiz' });
              continue;
            }
            updateData.startDate = parsed;
            nextStart = parsed;
          }
        }

        if (hasEnd) {
          const incoming = item.endDate;
          if (!incoming) {
            updateData.endDate = null;
            nextEnd = null;
          } else {
            const parsed = new Date(incoming);
            if (Number.isNaN(parsed.getTime())) {
              errors.push({ companyId, message: 'Bitiş tarihi geçersiz' });
              continue;
            }
            updateData.endDate = parsed;
            nextEnd = parsed;
          }
        }

        if (nextStart && nextEnd && nextStart > nextEnd) {
          errors.push({ companyId, message: 'Başlangıç tarihi bitiş tarihinden sonra olamaz' });
          continue;
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
          console.error('[BulkAssignDatesToCompanySubProjectsUseCase] updateMany failed:', error);
          errors.push({
            companyId: 'bulk',
            message: 'Tarih güncellemesi sırasında bir hata oluştu',
          });
        }
      }

      return Result.ok({
        updatedCount,
        errors,
      });
    } catch (error) {
      console.error('[BulkAssignDatesToCompanySubProjectsUseCase] Error:', error);
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Tarih güncelleme işlemi tamamlanamadı',
          500,
          'BULK_ASSIGN_DATES_FAILED'
        )
      );
    }
  }
}
