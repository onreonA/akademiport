import { ITaskRepository } from '@/domain/interfaces/repositories/ITaskRepository';
import { Task } from '@/domain/entities/Task';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class GetTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(id: string): Promise<Result<Task>> {
    try {
      const task = await this.taskRepository.findById(id);

      if (!task) {
        return Result.fail(new AppError('Task not found', 404));
      }

      return Result.ok(task);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to get task', 500)
      );
    }
  }
}
