import { IProjectRepository } from '@/domain/interfaces/repositories/IProjectRepository';
import { UpdateProjectDto } from '@/domain/entities/Project';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class UpdateProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(id: string, data: UpdateProjectDto): Promise<Result<void>> {
    try {
      // Check if project exists
      const exists = await this.projectRepository.exists(id);
      if (!exists) {
        return Result.fail(new AppError('Project not found', 404));
      }

      // Update project
      await this.projectRepository.update(id, data);

      return Result.ok();
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to update project', 500)
      );
    }
  }
}
