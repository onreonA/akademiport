import { ISubProjectRepository } from '@/domain/interfaces/repositories/ISubProjectRepository';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class DeleteSubProjectUseCase {
  constructor(private subProjectRepository: ISubProjectRepository) {}

  async execute(id: string): Promise<Result<void>> {
    try {
      // Check if sub-project exists
      const exists = await this.subProjectRepository.exists(id);
      if (!exists) {
        return Result.fail(new AppError('Sub-project not found', 404));
      }

      // Delete sub-project (cascade will delete tasks)
      await this.subProjectRepository.delete(id);

      return Result.ok();
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to delete sub-project', 500)
      );
    }
  }
}
