import { ICompanyTrainingRepository } from '@/domain/interfaces/repositories/ICompanyTrainingRepository';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

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
