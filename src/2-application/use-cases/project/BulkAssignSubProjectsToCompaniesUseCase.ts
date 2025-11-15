import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { ISubProjectRepository } from '@/3-domain/interfaces/repositories/ISubProjectRepository';
import { ICompanyProjectAssignmentRepository } from '@/3-domain/interfaces/repositories/ICompanyProjectAssignmentRepository';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import {
  BulkAssignmentRequestDTO,
  BulkAssignmentResultDTO,
} from '@/application/dto/project-assignment.dto';
import { CreateCompanyProjectAssignmentDto } from '@/3-domain/entities/CompanyProjectAssignment';

/**
 * BulkAssignSubProjectsToCompaniesUseCase
 * Sprint 8 Extension: Matris tabanlı toplu atama altyapısı
 */
export class BulkAssignSubProjectsToCompaniesUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly subProjectRepository: ISubProjectRepository,
    private readonly companyRepository: ICompanyRepository,
    private readonly assignmentRepository: ICompanyProjectAssignmentRepository
  ) {}

  async execute(request: BulkAssignmentRequestDTO): Promise<Result<BulkAssignmentResultDTO>> {
    try {
      const { projectId, assignments } = request;

      if (!projectId || projectId.trim().length === 0) {
        return Result.fail(new AppError('Proje bilgisi eksik', 400, 'PROJECT_ID_MISSING'));
      }

      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        return Result.fail(new AppError('Proje bulunamadı', 404, 'PROJECT_NOT_FOUND'));
      }

      const subProjects = await this.subProjectRepository.findByProjectId(projectId);
      const validSubProjectIds = new Set(subProjects.map((sp) => sp.id));

      const existingAssignments = await this.assignmentRepository.findByProject(projectId);
      const existingMap = new Map<string, Set<string>>();

      existingAssignments
        .filter((assignment) => assignment.subProjectId)
        .forEach((assignment) => {
          const key = assignment.companyId;
          if (!existingMap.has(key)) {
            existingMap.set(key, new Set());
          }
          existingMap.get(key)?.add(assignment.subProjectId as string);
        });

      const errors: BulkAssignmentResultDTO['errors'] = [];
      const payloadToCreate: CreateCompanyProjectAssignmentDto[] = [];
      const payloadToDelete: Array<{ companyId: string; subProjectId: string }> = [];

      for (const entry of assignments) {
        const companyId = entry.companyId?.trim();
        if (!companyId) {
          errors.push({ companyId: 'unknown', message: 'Firma bilgisi eksik' });
          continue;
        }

        const companyResult = await this.companyRepository.findById(companyId);
        if (companyResult.isFailure || !companyResult.value) {
          errors.push({ companyId, message: 'Firma bulunamadı' });
          continue;
        }

        const uniqueTargetIds = Array.from(new Set((entry.subProjectIds || []).filter(Boolean)));

        const invalidIds = uniqueTargetIds.filter((id) => !validSubProjectIds.has(id));
        if (invalidIds.length > 0) {
          invalidIds.forEach((invalidId) =>
            errors.push({
              companyId,
              subProjectId: invalidId,
              message: 'Alt proje bu projeye ait değil',
            })
          );
        }

        const desiredSet = new Set(uniqueTargetIds.filter((id) => validSubProjectIds.has(id)));
        const existingSet = new Set(existingMap.get(companyId) ?? []);

        for (const subProjectId of desiredSet) {
          if (!existingSet.has(subProjectId)) {
            payloadToCreate.push({
              companyId,
              projectId,
              subProjectId,
              isActive: true,
            });
          }
        }

        for (const subProjectId of existingSet) {
          if (!desiredSet.has(subProjectId)) {
            payloadToDelete.push({ companyId, subProjectId });
          }
        }
      }

      let successCount = 0;
      let removeCount = 0;

      if (payloadToCreate.length > 0) {
        try {
          const created = await this.assignmentRepository.createMany(payloadToCreate);
          successCount += created.length;
        } catch (error) {
          console.error('[BulkAssignSubProjectsToCompaniesUseCase] createMany failed:', error);
          errors.push({
            companyId: 'bulk',
            message: 'Yeni atamalar kaydedilirken bir hata oluştu',
          });
        }
      }

      for (const removal of payloadToDelete) {
        try {
          await this.assignmentRepository.deleteByCompanyAndSubProject(
            removal.companyId,
            removal.subProjectId
          );
          removeCount += 1;
        } catch (error) {
          console.error('[BulkAssignSubProjectsToCompaniesUseCase] delete failed:', {
            removal,
            error,
          });
          errors.push({
            companyId: removal.companyId,
            subProjectId: removal.subProjectId,
            message: 'Alt proje ataması silinemedi',
          });
        }
      }

      return Result.ok({
        successCount,
        removeCount,
        errors,
      });
    } catch (error) {
      console.error('[BulkAssignSubProjectsToCompaniesUseCase] Error:', error);
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Alt proje atamaları gerçekleştirilemedi',
          500,
          'BULK_ASSIGN_SUBPROJECTS_FAILED'
        )
      );
    }
  }
}
