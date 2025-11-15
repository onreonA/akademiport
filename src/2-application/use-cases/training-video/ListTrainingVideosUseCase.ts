import { ITrainingVideoRepository } from '@/3-domain/interfaces/repositories/ITrainingVideoRepository';
import { ITrainingRepository } from '@/3-domain/interfaces/repositories/ITrainingRepository';
import { TrainingVideo } from '@/3-domain/entities/TrainingVideo';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

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
