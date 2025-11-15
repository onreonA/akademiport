import { ITaskDependencyRepository } from '@/3-domain/interfaces/repositories/ITaskDependencyRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

/**
 * DeleteTaskDependencyUseCase
 * Görev bağımlılığını siler
 */
export class DeleteTaskDependencyUseCase {
  constructor(private taskDependencyRepository: ITaskDependencyRepository) {}

  async execute(id: string): Promise<Result<void>> {
    try {
      // Check if dependency exists
      const dependency = await this.taskDependencyRepository.findById(id);
      if (!dependency) {
        return Result.fail(new AppError('Task dependency not found', 404));
      }

      // Delete dependency
      await this.taskDependencyRepository.delete(id);

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to delete task dependency',
          500
        )
      );
    }
  }
}
