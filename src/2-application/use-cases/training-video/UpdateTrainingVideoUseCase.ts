import { ITrainingVideoRepository } from '@/domain/interfaces/repositories/ITrainingVideoRepository';
import { UpdateTrainingVideoDto } from '@/domain/entities/TrainingVideo';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class UpdateTrainingVideoUseCase {
  constructor(private trainingVideoRepository: ITrainingVideoRepository) {}

  async execute(id: string, data: UpdateTrainingVideoDto): Promise<Result<{ id: string }>> {
    try {
      // Check if video exists
      const existing = await this.trainingVideoRepository.findById(id);
      if (!existing) {
        return Result.fail(new AppError('Training video not found', 404));
      }

      // Validation
      if (data.title !== undefined && data.title.trim().length === 0) {
        return Result.fail(new AppError('Video title cannot be empty', 400));
      }

      if (data.youtubeUrl !== undefined) {
        const youtubeUrlPattern = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/;
        if (!youtubeUrlPattern.test(data.youtubeUrl)) {
          return Result.fail(new AppError('Invalid YouTube URL format', 400));
        }
      }

      // Update video
      const video = await this.trainingVideoRepository.update(id, data);

      return Result.ok({ id: video.id });
    } catch (error) {
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to update training video',
          500
        )
      );
    }
  }
}
