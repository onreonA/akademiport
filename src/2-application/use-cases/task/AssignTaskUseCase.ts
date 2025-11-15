import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

export class AssignTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(taskId: string, userId: string): Promise<Result<void>> {
    try {
      // Check if task exists
      const exists = await this.taskRepository.exists(taskId);
      if (!exists) {
        return Result.fail(new AppError('Task not found', 404));
      }

      // Assign task to user
      await this.taskRepository.assignTo(taskId, userId);

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to assign task', 500)
      );
    }
  }
}
