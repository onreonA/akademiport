import { ICompanyTrainingRepository } from '@/domain/interfaces/repositories/ICompanyTrainingRepository';
import { ICompanyRepository } from '@/domain/interfaces/repositories/ICompanyRepository';
import { ITrainingRepository } from '@/domain/interfaces/repositories/ITrainingRepository';
import { CompanyTraining } from '@/domain/entities/CompanyTraining';
import { Training } from '@/domain/entities/Training';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export interface CompanyTrainingWithTraining extends CompanyTraining {
  training: Training;
}

export class ListCompanyTrainingsUseCase {
  constructor(
    private companyTrainingRepository: ICompanyTrainingRepository,
    private companyRepository: ICompanyRepository,
    private trainingRepository: ITrainingRepository
  ) {}

  async execute(companyId: string): Promise<Result<CompanyTrainingWithTraining[]>> {
    try {
      // Check if company exists
      const companyResult = await this.companyRepository.findById(companyId);
      if (companyResult.isFailure || !companyResult.value) {
        return Result.fail(new AppError('Company not found', 404));
      }

      // Get company trainings
      const companyTrainings = await this.companyTrainingRepository.findByCompanyId(companyId);

      if (companyTrainings.length === 0) {
        return Result.ok([]);
      }

      // Fetch training details for each company training
      const companyTrainingsWithTraining: CompanyTrainingWithTraining[] = await Promise.all(
        companyTrainings.map(async (ct) => {
          const training = await this.trainingRepository.findById(ct.trainingId);
          if (!training) {
            throw new Error(`Training not found: ${ct.trainingId}`);
          }
          return {
            ...ct,
            training,
          };
        })
      );

      return Result.ok(companyTrainingsWithTraining);
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
