import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

export class ApproveTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(taskId: string, approvedBy: string): Promise<Result<void>> {
    try {
      // Get task
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        return Result.fail(new AppError('Task not found', 404));
      }

      // Check if task is in review or completed
      if (task.status !== 'review' && task.status !== 'done') {
        return Result.fail(new AppError('Task must be in review or completed to be approved', 400));
      }

      // Check if task is already approved
      if (task.approvedAt) {
        return Result.fail(new AppError('Task is already approved', 400));
      }

      // Approve task
      await this.taskRepository.approve(taskId, approvedBy);

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to approve task', 500)
      );
    }
  }
}
