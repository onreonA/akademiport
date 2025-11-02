import { ITrainingRepository } from '@/domain/interfaces/repositories/ITrainingRepository';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class DeleteTrainingUseCase {
  constructor(private trainingRepository: ITrainingRepository) {}

  async execute(id: string): Promise<Result<void>> {
    try {
      // Check if training exists
      const existing = await this.trainingRepository.findById(id);
      if (!existing) {
        return Result.fail(new AppError('Training not found', 404));
      }

      // Delete training
      await this.trainingRepository.delete(id);

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to delete training', 500)
      );
    }
  }
}
