import { IProjectRepository } from '@/domain/interfaces/repositories/IProjectRepository';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class DeleteProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(id: string): Promise<Result<void>> {
    try {
      // Check if project exists
      const exists = await this.projectRepository.exists(id);
      if (!exists) {
        return Result.fail(new AppError('Project not found', 404));
      }

      // Delete project (cascade will delete sub-projects and tasks)
      await this.projectRepository.delete(id);

      return Result.ok();
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to delete project', 500)
      );
    }
  }
}
