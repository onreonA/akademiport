import { ICompanyTrainingRepository } from '@/3-domain/interfaces/repositories/ICompanyTrainingRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

export class RemoveTrainingFromCompanyUseCase {
  constructor(private companyTrainingRepository: ICompanyTrainingRepository) {}

  async execute(companyId: string, trainingId: string): Promise<Result<void>> {
    try {
      // Check if assignment exists
      const existing = await this.companyTrainingRepository.findByCompanyAndTraining(
        companyId,
        trainingId
      );
      if (!existing) {
        return Result.fail(new AppError('Training assignment not found', 404));
      }

      // Remove assignment
      await this.companyTrainingRepository.deleteByCompanyAndTraining(companyId, trainingId);

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to remove training from company',
          500
        )
      );
    }
  }
}
