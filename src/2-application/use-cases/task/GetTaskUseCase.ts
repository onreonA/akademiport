import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { Task } from '@/3-domain/entities/Task';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

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
