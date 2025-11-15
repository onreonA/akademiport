import { ISubProjectRepository } from '@/3-domain/interfaces/repositories/ISubProjectRepository';
import { UpdateSubProjectDto } from '@/3-domain/entities/SubProject';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

export class UpdateSubProjectUseCase {
  constructor(private subProjectRepository: ISubProjectRepository) {}

  async execute(id: string, data: UpdateSubProjectDto): Promise<Result<void>> {
    try {
      // Check if sub-project exists
      const exists = await this.subProjectRepository.exists(id);
      if (!exists) {
        return Result.fail(new AppError('Sub-project not found', 404));
      }

      // Update sub-project
      await this.subProjectRepository.update(id, data);

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to update sub-project', 500)
      );
    }
  }
}
