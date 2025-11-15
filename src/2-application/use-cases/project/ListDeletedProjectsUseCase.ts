import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { Project } from '@/3-domain/entities/Project';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

/**
 * ListDeletedProjectsUseCase
 * Silinen projeleri listeler (sadece master_admin için)
 */
export class ListDeletedProjectsUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(): Promise<Result<Project[]>> {
    try {
      const deletedProjects = await this.projectRepository.findDeleted();

      return Result.ok(deletedProjects);
    } catch (error) {
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to list deleted projects',
          500
        )
      );
    }
  }
}
