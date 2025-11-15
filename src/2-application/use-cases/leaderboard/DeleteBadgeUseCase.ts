import { ILeaderboardRepository } from '@/3-domain/interfaces/repositories/ILeaderboardRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

export class DeleteBadgeUseCase {
  constructor(private leaderboardRepository: ILeaderboardRepository) {}

  async execute(badgeId: string): Promise<Result<void>> {
    try {
      const result = await this.leaderboardRepository.deleteBadge(badgeId);

      if (result.isFailure) {
        const errorMessage =
          result.error instanceof Error ? result.error.message : result.error || 'Rozet silinemedi';
        return Result.fail(new AppError(errorMessage, 500));
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Rozet silinemedi', 500)
      );
    }
  }
}
