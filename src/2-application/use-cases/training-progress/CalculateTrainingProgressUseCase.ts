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
      const videos = await this.trainingVideoRepository.findByTrainingId(trainingId);
      const documents = await this.trainingDocumentRepository.findByTrainingId(trainingId);

      // Ensure videos and documents are arrays (fallback to empty array if undefined)
      const videosArray = videos || [];
      const documentsArray = documents || [];

      // Get all progress records
      let progressList: TrainingProgress[] = [];
      try {
        progressList = await this.trainingProgressRepository.findByCompanyAndTraining(
          companyId,
          trainingId
        );
      } catch (error) {
        console.error('❌ TrainingProgressRepository.findByCompanyAndTraining failed:', {
          companyId,
          trainingId,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }

      // Count completed videos (progress_percentage = 100 or completed_at is not null)
      const completedVideos = progressList.filter(
        (p) => p.videoId && (p.progressPercentage === 100 || p.completedAt !== null)
      ).length;

      // Count completed documents (progress_percentage = 100 or completed_at is not null)
      const completedDocuments = progressList.filter(
        (p) => p.documentId && (p.progressPercentage === 100 || p.completedAt !== null)
      ).length;

      const totalVideos = videosArray.length;
      const totalDocuments = documentsArray.length;
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
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to calculate training progress';
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error('❌ CalculateTrainingProgressUseCase.execute error:', {
        companyId,
        trainingId,
        errorMessage,
        errorStack,
      });
      return Result.fail(new AppError(errorMessage, 500));
    }
  }
}
