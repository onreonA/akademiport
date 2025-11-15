import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { ProjectEntity, CreateProjectDto } from '@/3-domain/entities/Project';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

export class CreateProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(data: CreateProjectDto): Promise<Result<{ id: string }>> {
    try {
      // Validation
      const errors = ProjectEntity.validate(data);
      if (errors.length > 0) {
        return Result.fail(new AppError(errors.join(', '), 400));
      }

      // Create project
      const project = await this.projectRepository.create(data);

      return Result.ok({ id: project.id });
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to create project', 500)
      );
    }
  }
}
