import { ISubProjectRepository } from '@/domain/interfaces/repositories/ISubProjectRepository';
import { SubProject } from '@/domain/entities/SubProject';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

export class GetSubProjectUseCase {
  constructor(private subProjectRepository: ISubProjectRepository) {}

  async execute(id: string): Promise<Result<SubProject>> {
    try {
      const subProject = await this.subProjectRepository.findById(id);

      if (!subProject) {
        return Result.fail(new AppError('Sub-project not found', 404));
      }

      return Result.ok(subProject);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to get sub-project', 500)
      );
    }
  }
}
