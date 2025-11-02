import { ITrainingVideoRepository } from '@/domain/interfaces/repositories/ITrainingVideoRepository';
import { ITrainingDocumentRepository } from '@/domain/interfaces/repositories/ITrainingDocumentRepository';
import { ITrainingProgressRepository } from '@/domain/interfaces/repositories/ITrainingProgressRepository';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class UnlockNextContentUseCase {
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
  ): Promise<Result<void>> {
    try {
      if (videoId) {
        return this.unlockNextVideo(companyId, trainingId, videoId);
      }

      if (documentId) {
        return this.unlockNextDocument(companyId, trainingId, documentId);
      }

      return Result.fail(new AppError('Either videoId or documentId must be provided', 400));
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to unlock next content', 500)
      );
    }
  }

  private async unlockNextVideo(
    companyId: string,
    trainingId: string,
    videoId: string
  ): Promise<Result<void>> {
    // Get all videos for this training (ordered)
    const videos = await this.trainingVideoRepository.findByTrainingId(trainingId);
    const currentVideoIndex = videos.findIndex((v) => v.id === videoId);

    if (currentVideoIndex === -1) {
      return Result.fail(new AppError('Video not found', 404));
    }

    // Check if current video is completed
    const currentProgress = await this.trainingProgressRepository.findByVideo(companyId, videoId);
    if (!currentProgress || currentProgress.progressPercentage < 100) {
      return Result.fail(new AppError('Current video must be completed first', 400));
    }

    // Unlock next video if exists
    if (currentVideoIndex < videos.length - 1) {
      const nextVideo = videos[currentVideoIndex + 1];
      if (nextVideo.isLocked) {
        await this.trainingVideoRepository.update(nextVideo.id, { isLocked: false });
      }
    }

    return Result.ok(undefined);
  }

  private async unlockNextDocument(
    companyId: string,
    trainingId: string,
    documentId: string
  ): Promise<Result<void>> {
    // Get all documents for this training (ordered)
    const documents = await this.trainingDocumentRepository.findByTrainingId(trainingId);
    const currentDocumentIndex = documents.findIndex((d) => d.id === documentId);

    if (currentDocumentIndex === -1) {
      return Result.fail(new AppError('Document not found', 404));
    }

    // Check if current document is completed
    const currentProgress = await this.trainingProgressRepository.findByDocument(
      companyId,
      documentId
    );
    if (!currentProgress || currentProgress.progressPercentage < 100) {
      return Result.fail(new AppError('Current document must be completed first', 400));
    }

    // Unlock next document if exists
    if (currentDocumentIndex < documents.length - 1) {
      const nextDocument = documents[currentDocumentIndex + 1];
      if (nextDocument.isLocked) {
        await this.trainingDocumentRepository.update(nextDocument.id, { isLocked: false });
      }
    }

    return Result.ok(undefined);
  }
}
