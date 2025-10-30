import { ITaskRepository } from '@/domain/interfaces/repositories/ITaskRepository';
import { Task } from '@/domain/entities/Task';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export interface ListUserTasksFilters {
  status?: string;
  priority?: string;
}

export class ListUserTasksUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(userId: string, filters?: ListUserTasksFilters): Promise<Result<Task[]>> {
    try {
      const tasks = await this.taskRepository.findByAssignedUserId(userId, filters);

      return Result.ok(tasks);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to list user tasks', 500)
      );
    }
  }
}
