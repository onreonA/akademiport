import { ITaskDependencyRepository } from '@/3-domain/interfaces/repositories/ITaskDependencyRepository';
import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { TaskDependency } from '@/3-domain/entities/TaskDependency';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

/**
 * GetTaskDependenciesUseCase
 * Göreve ait bağımlılıkları getirir (bu görev hangi görevlere bağımlı)
 */
export class GetTaskDependenciesUseCase {
  constructor(
    private taskDependencyRepository: ITaskDependencyRepository,
    private taskRepository: ITaskRepository
  ) {}

  async execute(
    taskId: string
  ): Promise<Result<{ dependencies: TaskDependency[]; dependents: TaskDependency[] }>> {
    try {
      // Check if task exists
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        return Result.fail(new AppError('Task not found', 404));
      }

      // Get dependencies (bu görev hangi görevlere bağımlı)
      const dependencies = await this.taskDependencyRepository.findDependenciesOfTask(taskId);

      // Get dependents (bu göreve hangi görevler bağımlı)
      const dependents = await this.taskDependencyRepository.findDependentTasks(taskId);

      return Result.ok({ dependencies, dependents });
    } catch (error) {
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to get task dependencies',
          500
        )
      );
    }
  }
}
