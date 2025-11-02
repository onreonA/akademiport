import { ITrainingVideoRepository } from '@/domain/interfaces/repositories/ITrainingVideoRepository';
import { ITrainingDocumentRepository } from '@/domain/interfaces/repositories/ITrainingDocumentRepository';
import { ITrainingProgressRepository } from '@/domain/interfaces/repositories/ITrainingProgressRepository';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class CheckTrainingLockUseCase {
  constructor(
    private trainingVideoRepository: ITrainingVideoRepository,
    private trainingDocumentRepository: ITrainingDocumentRepository,
    private trainingProgressRepository: ITrainingProgressRepository
  ) {}

  async execute(
    companyId: string,
    trainingId: string,
    videoId?: string,
    documentId?: string
  ): Promise<Result<{ isLocked: boolean; reason?: string }>> {
    try {
      if (videoId) {
        return this.checkVideoLock(companyId, trainingId, videoId);
      }

      if (documentId) {
        return this.checkDocumentLock(companyId, trainingId, documentId);
      }

      return Result.fail(new AppError('Either videoId or documentId must be provided', 400));
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to check training lock', 500)
      );
    }
  }

  private async checkVideoLock(
    companyId: string,
    trainingId: string,
    videoId: string
  ): Promise<Result<{ isLocked: boolean; reason?: string }>> {
    // Get video
    const video = await this.trainingVideoRepository.findById(videoId);
    if (!video) {
      return Result.fail(new AppError('Video not found', 404));
    }

    // If video is not locked, it's accessible
    if (!video.isLocked) {
      return Result.ok({ isLocked: false });
    }

    // Get all videos for this training (ordered)
    const videos = await this.trainingVideoRepository.findByTrainingId(trainingId);
    const currentVideoIndex = videos.findIndex((v) => v.id === videoId);

    // First video is always accessible
    if (currentVideoIndex === 0) {
      return Result.ok({ isLocked: false });
    }

    // Check if previous video is completed
    const previousVideo = videos[currentVideoIndex - 1];
    const previousProgress = await this.trainingProgressRepository.findByVideo(
      companyId,
      previousVideo.id
    );

    if (!previousProgress || previousProgress.progressPercentage < 100) {
      return Result.ok({
        isLocked: true,
        reason: `Previous video "${previousVideo.title}" must be completed first`,
      });
    }

    return Result.ok({ isLocked: false });
  }

  private async checkDocumentLock(
    companyId: string,
    trainingId: string,
    documentId: string
  ): Promise<Result<{ isLocked: boolean; reason?: string }>> {
    // Get document
    const document = await this.trainingDocumentRepository.findById(documentId);
    if (!document) {
      return Result.fail(new AppError('Document not found', 404));
    }

    // If document is not locked, it's accessible
    if (!document.isLocked) {
      return Result.ok({ isLocked: false });
    }

    // Get all documents for this training (ordered)
    const documents = await this.trainingDocumentRepository.findByTrainingId(trainingId);
    const currentDocumentIndex = documents.findIndex((d) => d.id === documentId);

    // First document is always accessible
    if (currentDocumentIndex === 0) {
      return Result.ok({ isLocked: false });
    }

    // Check if previous document is completed
    const previousDocument = documents[currentDocumentIndex - 1];
    const previousProgress = await this.trainingProgressRepository.findByDocument(
      companyId,
      previousDocument.id
    );

    if (!previousProgress || previousProgress.progressPercentage < 100) {
      return Result.ok({
        isLocked: true,
        reason: `Previous document "${previousDocument.title}" must be completed first`,
      });
    }

    return Result.ok({ isLocked: false });
  }
}
