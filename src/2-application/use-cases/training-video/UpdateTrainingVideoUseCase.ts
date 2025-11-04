import { ITrainingVideoRepository } from '@/domain/interfaces/repositories/ITrainingVideoRepository';
import { UpdateTrainingVideoDto } from '@/domain/entities/TrainingVideo';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';
import { YouTubeApiService } from '@/infrastructure/external/youtube-api.service';

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

      // YouTube URL validation and metadata fetching
      if (data.youtubeUrl !== undefined) {
        const youtubeUrlPattern = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/;
        if (!youtubeUrlPattern.test(data.youtubeUrl)) {
          return Result.fail(new AppError('Invalid YouTube URL format', 400));
        }
      }

      // Prepare update data
      const updateData: UpdateTrainingVideoDto = { ...data };

      // If YouTube URL is updated, fetch new metadata
      if (data.youtubeUrl && data.youtubeUrl !== existing.youtubeUrl) {
        const youtubeId = YouTubeApiService.extractYouTubeId(data.youtubeUrl);
        if (youtubeId && YouTubeApiService.isAvailable()) {
          try {
            const metadata = await YouTubeApiService.getVideoMetadata(youtubeId);
            if (metadata) {
              // Update duration if not explicitly provided
              if (data.durationSeconds === undefined && metadata.duration > 0) {
                updateData.durationSeconds = metadata.duration;
              }
              // Update title if not explicitly provided and existing title is empty
              if (
                data.title === undefined &&
                (!existing.title || existing.title.trim().length === 0) &&
                metadata.title
              ) {
                updateData.title = metadata.title;
              }
              // Update description if not explicitly provided and existing description is empty
              if (
                data.description === undefined &&
                (!existing.description || existing.description.trim().length === 0) &&
                metadata.description
              ) {
                updateData.description = metadata.description;
              }
            }
          } catch (error) {
            // If metadata fetch fails, continue with manual data
            // This is a non-critical operation, so we don't fail the entire operation
            console.warn('Failed to fetch YouTube metadata:', error);
          }
        }
      }

      // Update video
      const video = await this.trainingVideoRepository.update(id, updateData);

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
