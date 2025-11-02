import { ITrainingVideoRepository } from '@/domain/interfaces/repositories/ITrainingVideoRepository';
import { ITrainingRepository } from '@/domain/interfaces/repositories/ITrainingRepository';
import { CreateTrainingVideoDto } from '@/domain/entities/TrainingVideo';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class CreateTrainingVideoUseCase {
  constructor(
    private trainingVideoRepository: ITrainingVideoRepository,
    private trainingRepository: ITrainingRepository
  ) {}

  async execute(data: CreateTrainingVideoDto): Promise<Result<{ id: string }>> {
    try {
      // Validation
      if (!data.title || data.title.trim().length === 0) {
        return Result.fail(new AppError('Video title is required', 400));
      }

      if (!data.youtubeUrl || data.youtubeUrl.trim().length === 0) {
        return Result.fail(new AppError('YouTube URL is required', 400));
      }

      // Validate YouTube URL format
      const youtubeUrlPattern = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/;
      if (!youtubeUrlPattern.test(data.youtubeUrl)) {
        return Result.fail(new AppError('Invalid YouTube URL format', 400));
      }

      // Check if training exists
      const training = await this.trainingRepository.findById(data.trainingId);
      if (!training) {
        return Result.fail(new AppError('Training not found', 404));
      }

      // Create video
      const video = await this.trainingVideoRepository.create(data);

      return Result.ok({ id: video.id });
    } catch (error) {
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to create training video',
          500
        )
      );
    }
  }
}
