import { ITrainingVideoRepository } from '@/domain/interfaces/repositories/ITrainingVideoRepository';
import { ITrainingRepository } from '@/domain/interfaces/repositories/ITrainingRepository';
import { TrainingVideo } from '@/domain/entities/TrainingVideo';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class ListTrainingVideosUseCase {
  constructor(
    private trainingVideoRepository: ITrainingVideoRepository,
    private trainingRepository: ITrainingRepository
  ) {}

  async execute(trainingId: string): Promise<Result<TrainingVideo[]>> {
    try {
      // Check if training exists
      const training = await this.trainingRepository.findById(trainingId);
      if (!training) {
        return Result.fail(new AppError('Training not found', 404));
      }

      // Get videos
      const videos = await this.trainingVideoRepository.findByTrainingId(trainingId);

      return Result.ok(videos);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to list training videos', 500)
      );
    }
  }
}
