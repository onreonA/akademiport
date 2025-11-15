import { ILeaderboardRepository } from '@/3-domain/interfaces/repositories/ILeaderboardRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { LeaderboardFilterDto } from '@/2-application/dtos/leaderboard/LeaderboardFilterDto';
import { LeaderboardRanking } from '@/3-domain/entities/Leaderboard';

export class GetLeaderboardUseCase {
  constructor(private leaderboardRepository: ILeaderboardRepository) {}

  async execute(filter?: LeaderboardFilterDto): Promise<Result<LeaderboardRanking[]>> {
    try {
      const result = await this.leaderboardRepository.getRankings(filter);

      if (result.isFailure) {
        const errorMessage = result.error instanceof Error ? result.error.message : (result.error || 'Liderlik tablosu alınamadı');
        return Result.fail(new AppError(errorMessage, 500));
      }

      return Result.ok(result.value);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Liderlik tablosu alınamadı', 500)
      );
    }
  }
}



