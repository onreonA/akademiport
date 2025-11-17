import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { NotificationService } from '@/5-shared/services/notification';
import { logger } from '@/5-shared/utils/logger';

export class RejectTaskUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private notificationService?: NotificationService
  ) {}

  async execute(taskId: string, reason?: string): Promise<Result<void>> {
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

      // Send notification to task assignee if service is available
      if (this.notificationService && task.assignedTo) {
        try {
          await this.notificationService.sendTaskRejected(
            task.assignedTo,
            taskId,
            task.title,
            reason,
            undefined, // projectId
            task.subProjectId
          );
        } catch (error) {
          // Log but don't fail the operation if notification fails
          logger.error('Failed to send task rejected notification', { error, taskId });
        }
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to reject task', 500)
      );
    }
  }
}
