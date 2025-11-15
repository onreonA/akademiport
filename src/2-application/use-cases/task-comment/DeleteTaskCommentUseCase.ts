import { ITaskCommentRepository } from '@/3-domain/interfaces/repositories/ITaskCommentRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

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

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to delete task comment', 500)
      );
    }
  }
}
