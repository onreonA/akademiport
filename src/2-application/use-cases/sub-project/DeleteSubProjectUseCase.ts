import { ISubProjectRepository } from '@/3-domain/interfaces/repositories/ISubProjectRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

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

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to delete sub-project', 500)
      );
    }
  }
}
