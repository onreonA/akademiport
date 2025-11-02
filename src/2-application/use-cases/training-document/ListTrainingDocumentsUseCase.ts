import { ITrainingDocumentRepository } from '@/domain/interfaces/repositories/ITrainingDocumentRepository';
import { ITrainingRepository } from '@/domain/interfaces/repositories/ITrainingRepository';
import { TrainingDocument } from '@/domain/entities/TrainingDocument';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class ListTrainingDocumentsUseCase {
  constructor(
    private trainingDocumentRepository: ITrainingDocumentRepository,
    private trainingRepository: ITrainingRepository
  ) {}

  async execute(trainingId: string): Promise<Result<TrainingDocument[]>> {
    try {
      // Check if training exists
      const training = await this.trainingRepository.findById(trainingId);
      if (!training) {
        return Result.fail(new AppError('Training not found', 404));
      }

      // Get documents
      const documents = await this.trainingDocumentRepository.findByTrainingId(trainingId);

      return Result.ok(documents);
    } catch (error) {
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to list training documents',
          500
        )
      );
    }
  }
}
