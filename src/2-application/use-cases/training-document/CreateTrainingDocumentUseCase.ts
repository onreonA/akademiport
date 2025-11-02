import { ITrainingDocumentRepository } from '@/domain/interfaces/repositories/ITrainingDocumentRepository';
import { ITrainingRepository } from '@/domain/interfaces/repositories/ITrainingRepository';
import { CreateTrainingDocumentDto } from '@/domain/entities/TrainingDocument';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class CreateTrainingDocumentUseCase {
  constructor(
    private trainingDocumentRepository: ITrainingDocumentRepository,
    private trainingRepository: ITrainingRepository
  ) {}

  async execute(data: CreateTrainingDocumentDto): Promise<Result<{ id: string }>> {
    try {
      // Validation
      if (!data.title || data.title.trim().length === 0) {
        return Result.fail(new AppError('Document title is required', 400));
      }

      if (!data.fileUrl || data.fileUrl.trim().length === 0) {
        return Result.fail(new AppError('File URL is required', 400));
      }

      if (!data.fileName || data.fileName.trim().length === 0) {
        return Result.fail(new AppError('File name is required', 400));
      }

      // Check if training exists
      const training = await this.trainingRepository.findById(data.trainingId);
      if (!training) {
        return Result.fail(new AppError('Training not found', 404));
      }

      // Create document
      const document = await this.trainingDocumentRepository.create(data);

      return Result.ok({ id: document.id });
    } catch (error) {
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to create training document',
          500
        )
      );
    }
  }
}
