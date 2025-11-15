import { ISubProjectRepository } from '@/3-domain/interfaces/repositories/ISubProjectRepository';
import { SubProject } from '@/3-domain/entities/SubProject';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

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
