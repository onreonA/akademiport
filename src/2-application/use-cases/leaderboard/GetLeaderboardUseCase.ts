import { ILeaderboardRepository } from '@/3-domain/interfaces/repositories/ILeaderboardRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { LeaderboardFilterDto } from '@/2-application/dtos/leaderboard/LeaderboardFilterDto';
import { LeaderboardRanking } from '@/3-domain/entities/Leaderboard';
import { cacheManager, cacheKeys } from '@/5-shared/cache/cache-manager';

export class GetLeaderboardUseCase {
  constructor(private leaderboardRepository: ILeaderboardRepository) {}

  async execute(filter?: LeaderboardFilterDto): Promise<Result<LeaderboardRanking[]>> {
    try {
      // Try to get from cache first
      const cacheKey = cacheKeys.leaderboard(filter?.programId, filter?.companyId);
      const cached = await cacheManager.get<LeaderboardRanking[]>(cacheKey);

      if (cached !== null) {
        return Result.ok(cached);
      }

      // If not in cache, fetch from repository
      const result = await this.leaderboardRepository.getRankings(filter);

      if (result.isFailure) {
        const errorMessage =
          result.error instanceof Error
            ? result.error.message
            : result.error || 'Liderlik tablosu alınamadı';
        return Result.fail(new AppError(errorMessage, 500));
      }

      // Cache the result (TTL: 5 minutes for leaderboard)
      await cacheManager.set(cacheKey, result.value, { ttl: 300 });

      return Result.ok(result.value);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Liderlik tablosu alınamadı', 500)
      );
    }
  }
}
