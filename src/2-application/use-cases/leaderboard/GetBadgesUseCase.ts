import { ILeaderboardRepository } from '@/3-domain/interfaces/repositories/ILeaderboardRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { Badge } from '@/3-domain/entities/Leaderboard';
import { BadgeFilter } from '@/3-domain/interfaces/repositories/ILeaderboardRepository';

export class GetBadgesUseCase {
  constructor(private leaderboardRepository: ILeaderboardRepository) {}

  async execute(filter?: BadgeFilter): Promise<Result<Badge[]>> {
    try {
      const result = await this.leaderboardRepository.getBadges(filter);

      if (result.isFailure) {
        const errorMessage = result.error instanceof Error ? result.error.message : (result.error || 'Rozetler alınamadı');
        return Result.fail(new AppError(errorMessage, 500));
      }

      return Result.ok(result.value);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Rozetler alınamadı', 500)
      );
    }
  }
}



