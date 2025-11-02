import { ITrainingRepository } from '@/domain/interfaces/repositories/ITrainingRepository';
import { Training } from '@/domain/entities/Training';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class GetTrainingUseCase {
  constructor(private trainingRepository: ITrainingRepository) {}

  async execute(id: string): Promise<Result<Training>> {
    try {
      const training = await this.trainingRepository.findById(id);

      if (!training) {
        return Result.fail(new AppError('Training not found', 404));
      }

      return Result.ok(training);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to get training', 500)
      );
    }
  }
}
