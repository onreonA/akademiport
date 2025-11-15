import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { Project } from '@/3-domain/entities/Project';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

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
