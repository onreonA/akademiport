import { ITaskRepository } from '@/domain/interfaces/repositories/ITaskRepository';
import { Task } from '@/domain/entities/Task';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class ListTasksUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(subProjectId: string): Promise<Result<Task[]>> {
    try {
      const tasks = await this.taskRepository.findBySubProjectId(subProjectId);

      return Result.ok(tasks);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to list tasks', 500)
      );
    }
  }
}
