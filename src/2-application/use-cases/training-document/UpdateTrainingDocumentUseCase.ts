import { ITrainingDocumentRepository } from '@/domain/interfaces/repositories/ITrainingDocumentRepository';
import { UpdateTrainingDocumentDto } from '@/domain/entities/TrainingDocument';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class UpdateTrainingDocumentUseCase {
  constructor(private trainingDocumentRepository: ITrainingDocumentRepository) {}

  async execute(id: string, data: UpdateTrainingDocumentDto): Promise<Result<{ id: string }>> {
    try {
      // Check if document exists
      const existing = await this.trainingDocumentRepository.findById(id);
      if (!existing) {
        return Result.fail(new AppError('Training document not found', 404));
      }

      // Validation
      if (data.title !== undefined && data.title.trim().length === 0) {
        return Result.fail(new AppError('Document title cannot be empty', 400));
      }

      if (data.fileName !== undefined && data.fileName.trim().length === 0) {
        return Result.fail(new AppError('File name cannot be empty', 400));
      }

      // Update document
      const document = await this.trainingDocumentRepository.update(id, data);

      return Result.ok({ id: document.id });
    } catch (error) {
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to update training document',
          500
        )
      );
    }
  }
}
