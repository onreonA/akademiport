import { ITrainingDocumentRepository } from '@/3-domain/interfaces/repositories/ITrainingDocumentRepository';
import { ITrainingRepository } from '@/3-domain/interfaces/repositories/ITrainingRepository';
import { TrainingDocument } from '@/3-domain/entities/TrainingDocument';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

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
