import { ITaskDependencyRepository } from '@/3-domain/interfaces/repositories/ITaskDependencyRepository';
import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

/**
 * ValidateTaskDependencyUseCase
 * Görev bağımlılığı geçerliliğini kontrol eder (circular dependency, task existence, etc.)
 */
export class ValidateTaskDependencyUseCase {
  constructor(
    private taskDependencyRepository: ITaskDependencyRepository,
    private taskRepository: ITaskRepository
  ) {}

  async execute(
    taskId: string,
    dependsOnTaskId: string
  ): Promise<Result<{ isValid: boolean; message: string }>> {
    try {
      // Check if task exists
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        return Result.ok({ isValid: false, message: 'Task not found' });
      }

      // Check if depends on task exists
      const dependsOnTask = await this.taskRepository.findById(dependsOnTaskId);
      if (!dependsOnTask) {
        return Result.ok({ isValid: false, message: 'Depends on task not found' });
      }

      // Check for self-dependency
      if (taskId === dependsOnTaskId) {
        return Result.ok({ isValid: false, message: 'Task cannot depend on itself' });
      }

      // Check if dependency already exists
      const exists = await this.taskDependencyRepository.exists(taskId, dependsOnTaskId);
      if (exists) {
        return Result.ok({ isValid: false, message: 'This dependency already exists' });
      }

      // Check for circular dependency
      const isCircular = await this.taskDependencyRepository.checkCircularDependency(
        taskId,
        dependsOnTaskId
      );
      if (isCircular) {
        return Result.ok({
          isValid: false,
          message:
            'Circular dependency detected. This dependency would create a circular reference.',
        });
      }

      return Result.ok({ isValid: true, message: 'Dependency is valid' });
    } catch (error) {
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to validate task dependency',
          500
        )
      );
    }
  }
}
