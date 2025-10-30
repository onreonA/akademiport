import { ISubProjectRepository } from '@/domain/interfaces/repositories/ISubProjectRepository';
import { IProjectRepository } from '@/domain/interfaces/repositories/IProjectRepository';
import { SubProjectEntity, CreateSubProjectDto } from '@/domain/entities/SubProject';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class CreateSubProjectUseCase {
  constructor(
    private subProjectRepository: ISubProjectRepository,
    private projectRepository: IProjectRepository
  ) {}

  async execute(data: CreateSubProjectDto): Promise<Result<{ id: string }>> {
    try {
      // Validation
      const errors = SubProjectEntity.validate(data);
      if (errors.length > 0) {
        return Result.fail(new AppError(errors.join(', '), 400));
      }

      // Check if project exists
      const projectExists = await this.projectRepository.exists(data.projectId);
      if (!projectExists) {
        return Result.fail(new AppError('Project not found', 404));
      }

      // Create sub-project
      const subProject = await this.subProjectRepository.create(data);

      return Result.ok({ id: subProject.id });
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to create sub-project', 500)
      );
    }
  }
}
