import { ITaskCommentRepository } from '@/3-domain/interfaces/repositories/ITaskCommentRepository';
import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { TaskCommentEntity, CreateTaskCommentDto } from '@/3-domain/entities/TaskComment';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

export class CreateTaskCommentUseCase {
  constructor(
    private taskCommentRepository: ITaskCommentRepository,
    private taskRepository: ITaskRepository
  ) {}

  async execute(data: CreateTaskCommentDto): Promise<Result<{ id: string }>> {
    try {
      // Validation
      const errors = TaskCommentEntity.validate(data);
      if (errors.length > 0) {
        return Result.fail(new AppError(errors.join(', '), 400));
      }

      // Check if task exists
      const taskExists = await this.taskRepository.exists(data.taskId);
      if (!taskExists) {
        return Result.fail(new AppError('Task not found', 404));
      }

      // Create comment
      const comment = await this.taskCommentRepository.create(data);

      return Result.ok({ id: comment.id });
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to create task comment', 500)
      );
    }
  }
}
