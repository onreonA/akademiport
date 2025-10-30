import { ITaskRepository } from '@/domain/interfaces/repositories/ITaskRepository';
import { ISubProjectRepository } from '@/domain/interfaces/repositories/ISubProjectRepository';
import { TaskEntity, CreateTaskDto } from '@/domain/entities/Task';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class CreateTaskUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private subProjectRepository: ISubProjectRepository
  ) {}

  async execute(data: CreateTaskDto): Promise<Result<{ id: string }>> {
    try {
      // Validation
      const errors = TaskEntity.validate(data);
      if (errors.length > 0) {
        return Result.fail(new AppError(errors.join(', '), 400));
      }

      // Check if sub-project exists
      const subProjectExists = await this.subProjectRepository.exists(data.subProjectId);
      if (!subProjectExists) {
        return Result.fail(new AppError('Sub-project not found', 404));
      }

      // Create task
      const task = await this.taskRepository.create(data);

      return Result.ok({ id: task.id });
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to create task', 500)
      );
    }
  }
}
