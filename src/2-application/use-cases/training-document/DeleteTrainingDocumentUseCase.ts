import { ITrainingDocumentRepository } from '@/domain/interfaces/repositories/ITrainingDocumentRepository';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class DeleteTrainingDocumentUseCase {
  constructor(private trainingDocumentRepository: ITrainingDocumentRepository) {}

  async execute(id: string): Promise<Result<void>> {
    try {
      // Check if document exists
      const existing = await this.trainingDocumentRepository.findById(id);
      if (!existing) {
        return Result.fail(new AppError('Training document not found', 404));
      }

      // Delete document
      await this.trainingDocumentRepository.delete(id);

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to delete training document',
          500
        )
      );
    }
  }
}
