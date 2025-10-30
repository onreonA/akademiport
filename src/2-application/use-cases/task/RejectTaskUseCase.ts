import { ITaskRepository } from '@/domain/interfaces/repositories/ITaskRepository';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class RejectTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(taskId: string): Promise<Result<void>> {
    try {
      // Get task
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        return Result.fail(new AppError('Task not found', 404));
      }

      // Check if task is in review
      if (task.status !== 'review') {
        return Result.fail(new AppError('Task must be in review to be rejected', 400));
      }

      // Reject task (set status back to 'in_progress')
      await this.taskRepository.reject(taskId);

      return Result.ok();
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to reject task', 500)
      );
    }
  }
}
