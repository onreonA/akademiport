import { ITaskRepository } from '@/domain/interfaces/repositories/ITaskRepository';
import { UpdateTaskDto } from '@/domain/entities/Task';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class UpdateTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(id: string, data: UpdateTaskDto): Promise<Result<void>> {
    try {
      // Check if task exists
      const exists = await this.taskRepository.exists(id);
      if (!exists) {
        return Result.fail(new AppError('Task not found', 404));
      }

      // Update task
      await this.taskRepository.update(id, data);

      return Result.ok();
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to update task', 500)
      );
    }
  }
}
