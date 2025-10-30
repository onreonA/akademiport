import { IProjectRepository } from '@/domain/interfaces/repositories/IProjectRepository';
import { Project } from '@/domain/entities/Project';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class GetProjectTemplatesUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(): Promise<Result<Project[]>> {
    try {
      const templates = await this.projectRepository.findTemplates();

      return Result.ok(templates);
    } catch (error) {
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to get project templates',
          500
        )
      );
    }
  }
}
