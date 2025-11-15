import { ITrainingRepository } from '@/3-domain/interfaces/repositories/ITrainingRepository';
import { Training } from '@/3-domain/entities/Training';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

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
