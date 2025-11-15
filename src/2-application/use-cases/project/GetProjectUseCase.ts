import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { Project } from '@/3-domain/entities/Project';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

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
