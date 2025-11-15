import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

/**
 * RestoreProjectUseCase
 * Silinen projeyi geri yükler (soft delete'den geri alır)
 */
export class RestoreProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(id: string): Promise<Result<void>> {
    try {
      // Restore project (repository will check if it exists and is deleted)
      await this.projectRepository.restore(id);

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to restore project', 500)
      );
    }
  }
}
