import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { NotificationService } from '@/5-shared/services/notification';
import { logger } from '@/5-shared/utils/logger';

export class ApproveTaskUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private notificationService?: NotificationService
  ) {}

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

      // Send notification to task assignee if service is available
      if (this.notificationService && task.assignedTo) {
        try {
          await this.notificationService.sendTaskApproved(
            task.assignedTo,
            taskId,
            task.title,
            undefined, // projectId
            task.subProjectId
          );
        } catch (error) {
          // Log but don't fail the operation if notification fails
          logger.error('Failed to send task approved notification', { error, taskId });
        }
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to approve task', 500)
      );
    }
  }
}
