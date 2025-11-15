import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

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

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to delete task', 500)
      );
    }
  }
}
