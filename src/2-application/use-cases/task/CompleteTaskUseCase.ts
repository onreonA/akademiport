import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { AddLeaderboardScoreUseCase } from '@/2-application/use-cases/leaderboard';
import { ActivityType } from '@/3-domain/enums/LeaderboardEnums';
import { NotificationService } from '@/5-shared/services/notification';
import { logger } from '@/5-shared/utils/logger';

export class CompleteTaskUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private addLeaderboardScore?: AddLeaderboardScoreUseCase,
    private notificationService?: NotificationService
  ) {}

  async execute(taskId: string, companyId?: string, programId?: string): Promise<Result<void>> {
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

      // Add leaderboard score if companyId and programId are provided
      if (companyId && programId && this.addLeaderboardScore) {
        const isEarly = task.dueDate && new Date() < task.dueDate;
        const activityType = isEarly
          ? ActivityType.TASK_COMPLETED_EARLY
          : ActivityType.TASK_COMPLETED;

        await this.addLeaderboardScore.execute({
          companyId,
          activityType,
          activityId: taskId,
          metadata: {
            taskTitle: task.title,
            subProjectId: task.subProjectId,
            completedEarly: isEarly,
          },
        });
      }

      // Send notification to consultant/reviewer if service is available
      if (this.notificationService && task.assignedTo) {
        try {
          await this.notificationService.sendTaskCompleted(
            task.assignedTo,
            taskId,
            task.title,
            undefined, // projectId
            task.subProjectId
          );
        } catch (error) {
          // Log but don't fail the operation if notification fails
          logger.error('Failed to send task completed notification', { error, taskId });
        }
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to complete task', 500)
      );
    }
  }
}
