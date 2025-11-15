import { ISubProjectRepository } from '@/3-domain/interfaces/repositories/ISubProjectRepository';
import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { SubProjectEntity, CreateSubProjectDto } from '@/3-domain/entities/SubProject';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

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
