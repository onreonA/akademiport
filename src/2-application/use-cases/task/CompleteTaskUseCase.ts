import { ITaskRepository } from '@/domain/interfaces/repositories/ITaskRepository';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class CompleteTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(taskId: string): Promise<Result<void>> {
    try {
      // Get task
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        return Result.fail(new AppError('Task not found', 404));
      }

      // Check if task is already completed
      if (task.status === 'done') {
        return Result.fail(new AppError('Task is already completed', 400));
      }

      // Check if task is cancelled
      if (task.status === 'cancelled') {
        return Result.fail(new AppError('Cannot complete a cancelled task', 400));
      }

      // Complete task (set status to 'review')
      await this.taskRepository.complete(taskId);

      return Result.ok();
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to complete task', 500)
      );
    }
  }
}
