import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

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

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to reject task', 500)
      );
    }
  }
}
