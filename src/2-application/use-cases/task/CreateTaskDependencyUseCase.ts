import { ITaskDependencyRepository } from '@/domain/interfaces/repositories/ITaskDependencyRepository';
import { ITaskRepository } from '@/domain/interfaces/repositories/ITaskRepository';
import { CreateTaskDependencyDto } from '@/domain/entities/TaskDependency';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';
import { TaskDependencyEntity } from '@/domain/entities/TaskDependency';

/**
 * CreateTaskDependencyUseCase
 * Görev bağımlılığı oluşturur
 */
export class CreateTaskDependencyUseCase {
  constructor(
    private taskDependencyRepository: ITaskDependencyRepository,
    private taskRepository: ITaskRepository
  ) {}

  async execute(data: CreateTaskDependencyDto): Promise<Result<TaskDependencyEntity>> {
    try {
      // Validation
      const validationErrors = TaskDependencyEntity.validate(data);
      if (validationErrors.length > 0) {
        return Result.fail(new AppError(validationErrors.join(', '), 400));
      }

      // Check if task exists
      const task = await this.taskRepository.findById(data.taskId);
      if (!task) {
        return Result.fail(new AppError('Task not found', 404));
      }

      // Check if depends on task exists
      const dependsOnTask = await this.taskRepository.findById(data.dependsOnTaskId);
      if (!dependsOnTask) {
        return Result.fail(new AppError('Depends on task not found', 404));
      }

      // Check if dependency already exists
      const exists = await this.taskDependencyRepository.exists(data.taskId, data.dependsOnTaskId);
      if (exists) {
        return Result.fail(new AppError('This dependency already exists', 409));
      }

      // Check for circular dependency
      const isCircular = await this.taskDependencyRepository.checkCircularDependency(
        data.taskId,
        data.dependsOnTaskId
      );
      if (isCircular) {
        return Result.fail(
          new AppError(
            'Circular dependency detected. This dependency would create a circular reference.',
            400
          )
        );
      }

      // Create dependency
      const dependency = await this.taskDependencyRepository.create(data);

      return Result.ok(new TaskDependencyEntity(dependency));
    } catch (error) {
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to create task dependency',
          500
        )
      );
    }
  }
}
