import { ISubProjectRepository } from '@/3-domain/interfaces/repositories/ISubProjectRepository';
import { SubProject } from '@/3-domain/entities/SubProject';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

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
