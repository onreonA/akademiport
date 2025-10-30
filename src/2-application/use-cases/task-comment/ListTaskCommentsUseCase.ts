import { ITaskCommentRepository } from '@/domain/interfaces/repositories/ITaskCommentRepository';
import { TaskComment } from '@/domain/entities/TaskComment';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class ListTaskCommentsUseCase {
  constructor(private taskCommentRepository: ITaskCommentRepository) {}

  async execute(taskId: string): Promise<Result<TaskComment[]>> {
    try {
      const comments = await this.taskCommentRepository.findByTaskId(taskId);

      return Result.ok(comments);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to list task comments', 500)
      );
    }
  }
}
