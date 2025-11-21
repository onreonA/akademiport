import { ICompanyTrainingRepository } from '@/3-domain/interfaces/repositories/ICompanyTrainingRepository';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import { ITrainingRepository } from '@/3-domain/interfaces/repositories/ITrainingRepository';
import { ITrainingVideoRepository } from '@/3-domain/interfaces/repositories/ITrainingVideoRepository';
import { ITrainingDocumentRepository } from '@/3-domain/interfaces/repositories/ITrainingDocumentRepository';
import { CompanyTraining } from '@/3-domain/entities/CompanyTraining';
import { Training } from '@/3-domain/entities/Training';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

export interface CompanyTrainingWithTraining extends CompanyTraining {
  training: Training;
  videosCount?: number;
  documentsCount?: number;
}

export interface ListCompanyTrainingsDebugInfo {
  companyId: string;
  companyName: string;
  programId: string | null;
  assignedTrainingsCount: number;
  programTrainingsFound: number;
  programTrainingsFiltered: number;
  totalTrainingsReturned: number;
}

export class ListCompanyTrainingsUseCase {
  private debugInfo: ListCompanyTrainingsDebugInfo | null = null;

  constructor(
    private companyTrainingRepository: ICompanyTrainingRepository,
    private companyRepository: ICompanyRepository,
    private trainingRepository: ITrainingRepository,
    private trainingVideoRepository: ITrainingVideoRepository,
    private trainingDocumentRepository: ITrainingDocumentRepository
  ) {}

  getDebugInfo(): ListCompanyTrainingsDebugInfo | null {
    return this.debugInfo;
  }

  async execute(companyId: string): Promise<Result<CompanyTrainingWithTraining[]>> {
    try {
      // Check if company exists
      const companyResult = await this.companyRepository.findById(companyId);
      if (companyResult.isFailure || !companyResult.value) {
        return Result.fail(new AppError('Company not found', 404));
      }

      const company = companyResult.value;

      console.log('🔍 [ListCompanyTrainingsUseCase] Company:', {
        id: company.id,
        name: company.name,
        programId: company.programId,
      });

      // Get assigned company trainings
      const companyTrainings = await this.companyTrainingRepository.findByCompanyId(companyId);
      console.log('🔍 [ListCompanyTrainingsUseCase] Assigned trainings:', companyTrainings.length);

      // Track which training IDs are already assigned
      const assignedTrainingIds = new Set(companyTrainings.map((ct) => ct.trainingId));

      // If company has a program, also get program-specific trainings
      let programTrainings: Training[] = [];
      let programTrainingsFound = 0;
      let programTrainingsFiltered = 0;

      if (company.programId) {
        try {
          programTrainings = await this.trainingRepository.findByProgramId(company.programId);
          programTrainingsFound = programTrainings.length;
          console.log(
            '🔍 [ListCompanyTrainingsUseCase] Program trainings found:',
            programTrainingsFound
          );
          console.log(
            '🔍 [ListCompanyTrainingsUseCase] Program trainings:',
            programTrainings.map((t) => ({
              id: t.id,
              name: t.name,
              isGlobal: t.isGlobal,
              status: t.status,
              programId: t.programId,
            }))
          );

          // Filter: only program-specific trainings (not global) and active status
          // Exclude trainings that are already assigned (they will be shown in assigned trainings section)
          programTrainings = programTrainings.filter(
            (t) => !t.isGlobal && t.status === 'active' && !assignedTrainingIds.has(t.id)
          );
          programTrainingsFiltered = programTrainings.length;
          console.log(
            '🔍 [ListCompanyTrainingsUseCase] Filtered program trainings:',
            programTrainingsFiltered
          );
        } catch (error) {
          // If fetching program trainings fails, continue with assigned trainings only
          console.warn(
            '⚠️ [ListCompanyTrainingsUseCase] Failed to fetch program trainings:',
            error
          );
        }
      } else {
        console.log('⚠️ [ListCompanyTrainingsUseCase] Company has no programId');
      }

      // Combine assigned trainings and program trainings
      const allTrainings: CompanyTrainingWithTraining[] = [];

      // Process assigned trainings (show ALL assigned trainings regardless of status)
      for (const ct of companyTrainings) {
        const training = await this.trainingRepository.findById(ct.trainingId);
        if (!training) {
          console.warn(`⚠️ [ListCompanyTrainingsUseCase] Training not found: ${ct.trainingId}`);
          continue;
        }

        console.log('✅ [ListCompanyTrainingsUseCase] Processing assigned training:', {
          id: training.id,
          name: training.name,
          status: training.status,
          isGlobal: training.isGlobal,
        });

        // Fetch video and document counts
        const videos = await this.trainingVideoRepository.findByTrainingId(ct.trainingId);
        const documents = await this.trainingDocumentRepository.findByTrainingId(ct.trainingId);

        allTrainings.push({
          ...ct,
          training,
          videosCount: videos.length,
          documentsCount: documents.length,
        });
      }

      // Process program trainings (not yet assigned)
      for (const training of programTrainings) {
        // Fetch video and document counts
        const videos = await this.trainingVideoRepository.findByTrainingId(training.id);
        const documents = await this.trainingDocumentRepository.findByTrainingId(training.id);

        // Create a virtual CompanyTraining entry (not yet assigned)
        // These are program trainings available to the company but not explicitly assigned
        allTrainings.push({
          id: `virtual-${training.id}`, // Virtual ID for unassigned trainings
          companyId,
          trainingId: training.id,
          assignedBy: training.createdBy || 'system', // Use training creator or 'system' as fallback
          assignedAt: training.createdAt, // Use training creation date
          status: 'assigned' as const, // Default status - available to company
          createdAt: training.createdAt,
          updatedAt: training.updatedAt,
          training,
          videosCount: videos.length,
          documentsCount: documents.length,
        });
      }

      console.log(
        '✅ [ListCompanyTrainingsUseCase] Total trainings to return:',
        allTrainings.length
      );

      // Store debug info
      this.debugInfo = {
        companyId,
        companyName: company.name,
        programId: company.programId || null,
        assignedTrainingsCount: companyTrainings.length,
        programTrainingsFound,
        programTrainingsFiltered,
        totalTrainingsReturned: allTrainings.length,
      };

      console.log('📊 [ListCompanyTrainingsUseCase] Summary:', this.debugInfo);
      return Result.ok(allTrainings);
    } catch (error) {
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to list company trainings',
          500
        )
      );
    }
  }
}
