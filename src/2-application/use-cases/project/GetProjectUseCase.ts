import { IProjectRepository } from '@/domain/interfaces/repositories/IProjectRepository';
import { Project } from '@/domain/entities/Project';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class GetProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(id: string): Promise<Result<Project>> {
    try {
      const project = await this.projectRepository.findById(id);

      if (!project) {
        return Result.fail(new AppError('Project not found', 404));
      }

      return Result.ok(project);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to get project', 500)
      );
    }
  }
}
