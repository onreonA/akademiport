import { ITaskCommentRepository } from '@/domain/interfaces/repositories/ITaskCommentRepository';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class DeleteTaskCommentUseCase {
  constructor(private taskCommentRepository: ITaskCommentRepository) {}

  async execute(id: string): Promise<Result<void>> {
    try {
      // Check if comment exists
      const exists = await this.taskCommentRepository.exists(id);
      if (!exists) {
        return Result.fail(new AppError('Task comment not found', 404));
      }

      // Delete comment
      await this.taskCommentRepository.delete(id);

      return Result.ok();
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to delete task comment', 500)
      );
    }
  }
}
