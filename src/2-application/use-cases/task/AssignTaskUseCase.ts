import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { NotificationService } from '@/5-shared/services/notification';
import { logger } from '@/5-shared/utils/logger';

export class AssignTaskUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private notificationService?: NotificationService
  ) {}

  async execute(taskId: string, userId: string): Promise<Result<void>> {
    try {
      // Check if task exists
      const exists = await this.taskRepository.exists(taskId);
      if (!exists) {
        return Result.fail(new AppError('Task not found', 404));
      }

      // Get task details for notification
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        return Result.fail(new AppError('Task not found', 404));
      }

      // Assign task to user
      await this.taskRepository.assignTo(taskId, userId);

      // Send notification if service is available
      if (this.notificationService) {
        try {
          await this.notificationService.sendTaskAssigned(
            userId,
            taskId,
            task.title,
            task.subProjectId ? undefined : undefined, // projectId will be extracted from subProject if needed
            task.subProjectId
          );
        } catch (error) {
          // Log but don't fail the operation if notification fails
          logger.error('Failed to send task assigned notification', { error, taskId, userId });
        }
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to assign task', 500)
      );
    }
  }
}
