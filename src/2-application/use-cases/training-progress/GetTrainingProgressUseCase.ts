import { ITrainingProgressRepository } from '@/3-domain/interfaces/repositories/ITrainingProgressRepository';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import { ITrainingRepository } from '@/3-domain/interfaces/repositories/ITrainingRepository';
import { TrainingProgress } from '@/3-domain/entities/TrainingProgress';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

export class GetTrainingProgressUseCase {
  constructor(
    private trainingProgressRepository: ITrainingProgressRepository,
    private companyRepository: ICompanyRepository,
    private trainingRepository: ITrainingRepository
  ) {}

  async execute(companyId: string, trainingId: string): Promise<Result<TrainingProgress[]>> {
    try {
      // Check if company exists
      const companyResult = await this.companyRepository.findById(companyId);
      if (companyResult.isFailure || !companyResult.value) {
        return Result.fail(new AppError('Company not found', 404));
      }

      // Check if training exists
      const training = await this.trainingRepository.findById(trainingId);
      if (!training) {
        return Result.fail(new AppError('Training not found', 404));
      }

      // Get progress
      const progressList = await this.trainingProgressRepository.findByCompanyAndTraining(
        companyId,
        trainingId
      );

      return Result.ok(progressList);
    } catch (error) {
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to get training progress',
          500
        )
      );
    }
  }
}
