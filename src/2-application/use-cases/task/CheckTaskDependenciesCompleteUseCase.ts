import { ITaskDependencyRepository } from '@/domain/interfaces/repositories/ITaskDependencyRepository';
import { ITaskRepository } from '@/domain/interfaces/repositories/ITaskRepository';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

/**
 * CheckTaskDependenciesCompleteUseCase
 * Bir görevin bağımlı olduğu görevlerin tamamlanmış olup olmadığını kontrol eder
 */
export class CheckTaskDependenciesCompleteUseCase {
  constructor(
    private taskDependencyRepository: ITaskDependencyRepository,
    private taskRepository: ITaskRepository
  ) {}

  async execute(
    taskId: string
  ): Promise<Result<{ allComplete: boolean; incompleteDependencies: string[] }>> {
    try {
      // Check if task exists
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        return Result.fail(new AppError('Task not found', 404));
      }

      // Get dependencies (bu görev hangi görevlere bağımlı - sadece 'blocks' tipindekiler)
      const allDependencies = await this.taskDependencyRepository.findDependenciesOfTask(taskId);

      // Sadece 'blocks' tipindeki bağımlılıkları kontrol et (zorunlu bağımlılıklar)
      const blockingDependencies = allDependencies.filter((dep) => dep.dependencyType === 'blocks');

      if (blockingDependencies.length === 0) {
        return Result.ok({ allComplete: true, incompleteDependencies: [] });
      }

      // Bağımlı olduğu görevlerin durumunu kontrol et
      const incompleteDependencies: string[] = [];

      for (const dependency of blockingDependencies) {
        const dependsOnTask = await this.taskRepository.findById(dependency.dependsOnTaskId);

        if (!dependsOnTask || dependsOnTask.status !== 'done') {
          incompleteDependencies.push(dependency.dependsOnTaskId);
        }
      }

      const allComplete = incompleteDependencies.length === 0;

      return Result.ok({
        allComplete,
        incompleteDependencies,
      });
    } catch (error) {
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to check task dependencies',
          500
        )
      );
    }
  }
}
