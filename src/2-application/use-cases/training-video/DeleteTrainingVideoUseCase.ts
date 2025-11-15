import { ITrainingVideoRepository } from '@/3-domain/interfaces/repositories/ITrainingVideoRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

export class DeleteTrainingVideoUseCase {
  constructor(private trainingVideoRepository: ITrainingVideoRepository) {}

  async execute(id: string): Promise<Result<void>> {
    try {
      // Check if video exists
      const existing = await this.trainingVideoRepository.findById(id);
      if (!existing) {
        return Result.fail(new AppError('Training video not found', 404));
      }

      // Delete video
      await this.trainingVideoRepository.delete(id);

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to delete training video',
          500
        )
      );
    }
  }
}
