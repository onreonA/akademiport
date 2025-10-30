import { ISubProjectRepository } from '@/domain/interfaces/repositories/ISubProjectRepository';
import { SubProject } from '@/domain/entities/SubProject';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class ListSubProjectsUseCase {
  constructor(private subProjectRepository: ISubProjectRepository) {}

  async execute(projectId: string): Promise<Result<SubProject[]>> {
    try {
      const subProjects = await this.subProjectRepository.findByProjectId(projectId);

      return Result.ok(subProjects);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to list sub-projects', 500)
      );
    }
  }
}
