import { ITrainingProgressRepository } from '@/domain/interfaces/repositories/ITrainingProgressRepository';
import { ITrainingVideoRepository } from '@/domain/interfaces/repositories/ITrainingVideoRepository';
import { ITrainingDocumentRepository } from '@/domain/interfaces/repositories/ITrainingDocumentRepository';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export interface TrainingProgressCalculation {
  totalVideos: number;
  completedVideos: number;
  totalDocuments: number;
  completedDocuments: number;
  overallProgress: number; // 0-100
}

export class CalculateTrainingProgressUseCase {
  constructor(
    private trainingProgressRepository: ITrainingProgressRepository,
    private trainingVideoRepository: ITrainingVideoRepository,
    private trainingDocumentRepository: ITrainingDocumentRepository
  ) {}

  async execute(
    companyId: string,
    trainingId: string
  ): Promise<Result<TrainingProgressCalculation>> {
    try {
      // Get all videos and documents
      const videosResult = await this.trainingVideoRepository.findByTrainingId(trainingId);
      const documentsResult = await this.trainingDocumentRepository.findByTrainingId(trainingId);

      const videos = videosResult.data;
      const documents = documentsResult.data;

      // Get all progress records
      const progressList = await this.trainingProgressRepository.findByCompanyAndTraining(
        companyId,
        trainingId
      );

      // Count completed videos (progress_percentage = 100 or completed_at is not null)
      const completedVideos = progressList.filter(
        (p) => p.videoId && (p.progressPercentage === 100 || p.completedAt !== null)
      ).length;

      // Count completed documents (progress_percentage = 100 or completed_at is not null)
      const completedDocuments = progressList.filter(
        (p) => p.documentId && (p.progressPercentage === 100 || p.completedAt !== null)
      ).length;

      const totalVideos = videos.length;
      const totalDocuments = documents.length;
      const totalContent = totalVideos + totalDocuments;
      const completedContent = completedVideos + completedDocuments;

      // Calculate overall progress
      const overallProgress =
        totalContent > 0 ? Math.round((completedContent / totalContent) * 100) : 0;

      return Result.ok({
        totalVideos,
        completedVideos,
        totalDocuments,
        completedDocuments,
        overallProgress,
      });
    } catch (error) {
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to calculate training progress',
          500
        )
      );
    }
  }
}
