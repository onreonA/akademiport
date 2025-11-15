import { ITrainingProgressRepository } from '@/3-domain/interfaces/repositories/ITrainingProgressRepository';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import { ITrainingRepository } from '@/3-domain/interfaces/repositories/ITrainingRepository';
import {
  CreateTrainingProgressDto,
  UpdateTrainingProgressDto,
} from '@/3-domain/entities/TrainingProgress';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { AddLeaderboardScoreUseCase } from '@/2-application/use-cases/leaderboard';
import { ActivityType } from '@/3-domain/enums/LeaderboardEnums';

export class UpdateTrainingProgressUseCase {
  constructor(
    private trainingProgressRepository: ITrainingProgressRepository,
    private companyRepository: ICompanyRepository,
    private trainingRepository: ITrainingRepository,
    private addLeaderboardScore?: AddLeaderboardScoreUseCase
  ) {}

  async execute(
    companyId: string,
    trainingId: string,
    data: CreateTrainingProgressDto | UpdateTrainingProgressDto
  ): Promise<Result<{ id: string }>> {
    try {
      // Check if company exists
      const companyResult = await this.companyRepository.findById(companyId);
      if (companyResult.isFailure || !companyResult.value) {
        return Result.fail(new AppError('Company not found', 404));
      }

      // Check if training exists
      const training = await this.trainingRepository.findById(trainingId);
      if (!training) {
        return Result.fail(new AppError('Training not found', 404));
      }

      // Validation
      if ('progressPercentage' in data && data.progressPercentage !== undefined) {
        if (data.progressPercentage < 0 || data.progressPercentage > 100) {
          return Result.fail(new AppError('Progress percentage must be between 0 and 100', 400));
        }
      }

      // Check if progress exists for video/document
      let progress = null;
      if ('videoId' in data && data.videoId) {
        progress = await this.trainingProgressRepository.findByVideo(companyId, data.videoId);
      } else if ('documentId' in data && data.documentId) {
        progress = await this.trainingProgressRepository.findByDocument(companyId, data.documentId);
      }

      if (progress) {
        // Update existing progress
        const updateData: UpdateTrainingProgressDto = {};
        if ('progressPercentage' in data && data.progressPercentage !== undefined) {
          updateData.progressPercentage = data.progressPercentage;
        }
        if ('watchedAt' in data) updateData.watchedAt = data.watchedAt || null;
        if ('readAt' in data) updateData.readAt = data.readAt || null;
        if ('completedAt' in data) updateData.completedAt = data.completedAt || null;

        const updated = await this.trainingProgressRepository.update(progress.id, updateData);

        // Add leaderboard score if video/document completed
        if (this.addLeaderboardScore && updated.completedAt && !progress.completedAt) {
          if (updated.videoId) {
            await this.addLeaderboardScore.execute({
              companyId,
              activityType: ActivityType.VIDEO_WATCHED,
              activityId: updated.videoId,
              metadata: {
                trainingId,
                videoId: updated.videoId,
                completed: true,
              },
            });
          } else if (updated.documentId) {
            await this.addLeaderboardScore.execute({
              companyId,
              activityType: ActivityType.DOCUMENT_READ,
              activityId: updated.documentId,
              metadata: {
                trainingId,
                documentId: updated.documentId,
                completed: true,
              },
            });
          }
        }

        return Result.ok({ id: updated.id });
      } else {
        // Create new progress
        const createData: CreateTrainingProgressDto = {
          companyId,
          trainingId,
          videoId: 'videoId' in data ? data.videoId : null,
          documentId: 'documentId' in data ? data.documentId : null,
          progressPercentage:
            'progressPercentage' in data && data.progressPercentage !== undefined
              ? data.progressPercentage
              : 0,
          watchedAt: 'watchedAt' in data ? data.watchedAt || null : null,
          readAt: 'readAt' in data ? data.readAt || null : null,
          completedAt: 'completedAt' in data ? data.completedAt || null : null,
        };

        const created = await this.trainingProgressRepository.create(createData);

        // Add leaderboard score if video/document completed
        if (this.addLeaderboardScore && created.completedAt) {
          if (created.videoId) {
            await this.addLeaderboardScore.execute({
              companyId,
              activityType: ActivityType.VIDEO_WATCHED,
              activityId: created.videoId,
              metadata: {
                trainingId,
                videoId: created.videoId,
                completed: true,
              },
            });
          } else if (created.documentId) {
            await this.addLeaderboardScore.execute({
              companyId,
              activityType: ActivityType.DOCUMENT_READ,
              activityId: created.documentId,
              metadata: {
                trainingId,
                documentId: created.documentId,
                completed: true,
              },
            });
          }
        }

        return Result.ok({ id: created.id });
      }
    } catch (error) {
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to update training progress',
          500
        )
      );
    }
  }
}
