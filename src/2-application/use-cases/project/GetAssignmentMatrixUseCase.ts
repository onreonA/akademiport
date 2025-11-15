import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { ISubProjectRepository } from '@/3-domain/interfaces/repositories/ISubProjectRepository';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import { ICompanyProjectAssignmentRepository } from '@/3-domain/interfaces/repositories/ICompanyProjectAssignmentRepository';
import { IUserRepository } from '@/3-domain/interfaces/IUserRepository';
import { ProjectAssignmentMatrixDTO } from '@/application/dto/project-assignment.dto';

/**
 * GetAssignmentMatrixUseCase
 * Sprint 8 Extension: Firma x Alt Proje matrisi verisini hazırlar
 *
 * DÜZELTME: Projeye ait tüm firmaları bulmak için consultant'ın programlarını kullanır
 */
export class GetAssignmentMatrixUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly subProjectRepository: ISubProjectRepository,
    private readonly companyRepository: ICompanyRepository,
    private readonly assignmentRepository: ICompanyProjectAssignmentRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(projectId: string): Promise<Result<ProjectAssignmentMatrixDTO>> {
    try {
      if (!projectId || projectId.trim().length === 0) {
        return Result.fail(new AppError('Proje bilgisi eksik', 400));
      }

      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        return Result.fail(new AppError('Proje bulunamadı', 404));
      }

      const subProjects = await this.subProjectRepository.findByProjectId(projectId);
      const assignments = await this.assignmentRepository.findByProject(projectId);

      // DÜZELTME: Projeye ait tüm firmaları bul
      // 1. Proje programId'ye sahipse direkt o programdaki firmaları bul
      const allCompanyIds = new Set<string>();

      if (project.programId) {
        // Performans iyileştirmesi: Direkt programId kullan
        const companiesResult = await this.companyRepository.findByProgramId(project.programId);
        if (companiesResult.isSuccess && companiesResult.value) {
          companiesResult.value.forEach((company) => {
            allCompanyIds.add(company.id);
          });
        }
      } else if (project.consultantId) {
        // Fallback: Consultant'ın programlarını bul (eski yöntem)
        const programsResult = await this.userRepository.getPrograms(project.consultantId);
        if (programsResult.isSuccess && programsResult.value) {
          const programIds = programsResult.value.map((p) => p.id);

          // Her programdaki firmaları bul
          for (const programId of programIds) {
            const companiesResult = await this.companyRepository.findByProgramId(programId);
            if (companiesResult.isSuccess && companiesResult.value) {
              companiesResult.value.forEach((company) => {
                allCompanyIds.add(company.id);
              });
            }
          }
        }
      }

      // 2. Atanmış firmaları da ekle (eğer programda değilse)
      assignments.forEach((assignment) => {
        allCompanyIds.add(assignment.companyId);
      });

      // 4. Tüm firmaları getir
      const companies = [];
      for (const companyId of allCompanyIds) {
        const companyResult = await this.companyRepository.findById(companyId);
        if (companyResult.isFailure || !companyResult.value) {
          console.warn('[GetAssignmentMatrixUseCase] Company not found', {
            companyId,
            projectId,
          });
          continue;
        }

        const company = companyResult.value;
        companies.push({
          id: company.id,
          name: company.name,
          programName: undefined, // TODO: Program adını ekle
          city: company.city ?? null,
          sector: company.sector ?? null,
          isActive: company.isActive,
        });
      }

      companies.sort((a, b) => a.name.localeCompare(b.name, 'tr'));

      const subProjectDtos = subProjects
        .slice()
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
        .map((subProject) => ({
          id: subProject.id,
          name: subProject.name,
          description: subProject.description,
          status: subProject.status,
          orderIndex: subProject.orderIndex ?? 0,
        }));

      const assignmentDtos = assignments.map((assignment) => ({
        companyId: assignment.companyId,
        projectId: assignment.projectId,
        subProjectId: assignment.subProjectId,
        startDate: assignment.startDate ? assignment.startDate.toISOString() : null,
        endDate: assignment.endDate ? assignment.endDate.toISOString() : null,
        isActive: assignment.isActive,
      }));

      const projectPayload: ProjectAssignmentMatrixDTO['project'] = {
        id: project.id,
        name: project.name,
      };

      if (project.consultantId) {
        projectPayload.consultantId = project.consultantId;
      }

      return Result.ok({
        project: projectPayload,
        companies,
        subProjects: subProjectDtos,
        assignments: assignmentDtos,
      });
    } catch (error) {
      console.error('[GetAssignmentMatrixUseCase] Error:', error);
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Atama matrisi getirilemedi', 500)
      );
    }
  }
}
