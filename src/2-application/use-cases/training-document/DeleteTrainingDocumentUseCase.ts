import { ITrainingDocumentRepository } from '@/3-domain/interfaces/repositories/ITrainingDocumentRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

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
