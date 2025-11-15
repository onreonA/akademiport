import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { UpdateProjectDto } from '@/3-domain/entities/Project';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

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

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to update project', 500)
      );
    }
  }
}
