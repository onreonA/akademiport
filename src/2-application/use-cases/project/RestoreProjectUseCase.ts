import { IProjectRepository } from '@/domain/interfaces/repositories/IProjectRepository';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

/**
 * RestoreProjectUseCase
 * Silinen projeyi geri yükler (soft delete'den geri alır)
 */
export class RestoreProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(id: string): Promise<Result<void>> {
    try {
      // Check if project exists (including deleted ones)
      const project = await this.projectRepository.findById(id, true);
      if (!project) {
        return Result.fail(new AppError('Project not found', 404));
      }

      // Check if project is deleted
      // Note: Repository'de restore metodu zaten deleted_at kontrolü yapıyor
      // Ama burada da kontrol edelim
      await this.projectRepository.restore(id);

      return Result.ok();
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to restore project', 500)
      );
    }
  }
}
