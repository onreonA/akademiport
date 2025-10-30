import { ITaskRepository } from '@/domain/interfaces/repositories/ITaskRepository';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class DeleteTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(id: string): Promise<Result<void>> {
    try {
      // Check if task exists
      const exists = await this.taskRepository.exists(id);
      if (!exists) {
        return Result.fail(new AppError('Task not found', 404));
      }

      // Delete task
      await this.taskRepository.delete(id);

      return Result.ok();
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to delete task', 500)
      );
    }
  }
}
