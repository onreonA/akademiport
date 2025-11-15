import { ITrainingVideoRepository } from '@/3-domain/interfaces/repositories/ITrainingVideoRepository';
import { ITrainingRepository } from '@/3-domain/interfaces/repositories/ITrainingRepository';
import { CreateTrainingVideoDto } from '@/3-domain/entities/TrainingVideo';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { YouTubeApiService } from '@/infrastructure/external/youtube-api.service';

export class CreateTrainingVideoUseCase {
  constructor(
    private trainingVideoRepository: ITrainingVideoRepository,
    private trainingRepository: ITrainingRepository
  ) {}

  async execute(data: CreateTrainingVideoDto): Promise<Result<{ id: string }>> {
    try {
      // Validation
      if (!data.youtubeUrl || data.youtubeUrl.trim().length === 0) {
        return Result.fail(new AppError('YouTube URL is required', 400));
      }

      // Validate YouTube URL format
      const youtubeUrlPattern = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/;
      if (!youtubeUrlPattern.test(data.youtubeUrl)) {
        return Result.fail(new AppError('Invalid YouTube URL format', 400));
      }

      // Extract YouTube ID and fetch metadata if available
      const youtubeId = YouTubeApiService.extractYouTubeId(data.youtubeUrl);
      let durationSeconds = data.durationSeconds || null;
      let title = data.title || '';
      let description = data.description || null;

      console.log('🔍 CreateTrainingVideoUseCase:', {
        youtubeUrl: data.youtubeUrl,
        extractedYoutubeId: youtubeId,
        apiAvailable: YouTubeApiService.isAvailable(),
        initialTitle: title,
        initialDescription: description,
        initialDuration: durationSeconds,
      });

      // Try to fetch metadata from YouTube API if API key is configured
      if (youtubeId && YouTubeApiService.isAvailable()) {
        try {
          console.log('📡 Fetching YouTube metadata for ID:', youtubeId);
          const metadata = await YouTubeApiService.getVideoMetadata(youtubeId);
          if (metadata) {
            console.log('✅ YouTube metadata fetched:', {
              title: metadata.title,
              description: metadata.description,
              duration: metadata.duration,
            });
            // Use YouTube title if title is not provided or empty
            if (!title || title.trim().length === 0) {
              title = metadata.title;
            }
            // Use YouTube description if description is not provided or empty
            if (!description || description.trim().length === 0) {
              description = metadata.description || null;
            }
            // Use YouTube duration if duration is not provided
            if (!durationSeconds && metadata.duration > 0) {
              durationSeconds = metadata.duration;
            }
          } else {
            console.warn('⚠️ YouTube metadata is null (video not found or API error)');
          }
        } catch (error) {
          // If metadata fetch fails, continue with manual data
          // This is a non-critical operation, so we don't fail the entire operation
          console.warn('⚠️ Failed to fetch YouTube metadata:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
          });
        }
      } else {
        if (!youtubeId) {
          console.warn('⚠️ Could not extract YouTube ID from URL:', data.youtubeUrl);
        }
        if (!YouTubeApiService.isAvailable()) {
          console.warn('⚠️ YouTube API key not configured');
        }
      }

      // Final validation: title must be set (either manually or from YouTube)
      if (!title || title.trim().length === 0) {
        return Result.fail(
          new AppError(
            'Video title is required. Please provide a title or configure YouTube API key.',
            400
          )
        );
      }

      // Note: Training existence check is done implicitly by the database foreign key constraint
      // If training doesn't exist or user doesn't have access, the insert will fail with a foreign key error
      // This avoids RLS policy issues where findById might not find the training even if it exists

      // Create video with potentially updated title, description, and duration
      const videoData: CreateTrainingVideoDto = {
        ...data,
        title,
        description: description,
        durationSeconds,
      };

      console.log('📝 Creating video with data:', {
        trainingId: videoData.trainingId,
        title: videoData.title,
        durationSeconds: videoData.durationSeconds,
        youtubeUrl: videoData.youtubeUrl,
      });

      // If training doesn't exist or user doesn't have permission, this will fail
      try {
        const video = await this.trainingVideoRepository.create(videoData);
        console.log('✅ Video created successfully:', video.id);
        return Result.ok({ id: video.id });
      } catch (repoError) {
        console.error('❌ TrainingVideoRepository.create error:', {
          error: repoError instanceof Error ? repoError.message : 'Unknown error',
          stack: repoError instanceof Error ? repoError.stack : undefined,
        });
        throw repoError; // Re-throw to be caught by outer catch
      }
    } catch (error) {
      console.error('❌ CreateTrainingVideoUseCase.execute error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to create training video',
          500
        )
      );
    }
  }
}
