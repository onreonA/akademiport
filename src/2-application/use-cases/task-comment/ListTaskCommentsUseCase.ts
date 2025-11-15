import { ITaskCommentRepository } from '@/3-domain/interfaces/repositories/ITaskCommentRepository';
import { TaskComment } from '@/3-domain/entities/TaskComment';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

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
