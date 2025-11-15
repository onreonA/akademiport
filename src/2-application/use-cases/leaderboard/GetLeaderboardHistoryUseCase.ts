import { ILeaderboardRepository } from '@/3-domain/interfaces/repositories/ILeaderboardRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { LeaderboardHistory } from '@/3-domain/entities/Leaderboard';
import { HistoryFilter } from '@/3-domain/interfaces/repositories/ILeaderboardRepository';

export class GetLeaderboardHistoryUseCase {
  constructor(private leaderboardRepository: ILeaderboardRepository) {}

  async execute(filter?: HistoryFilter): Promise<Result<LeaderboardHistory[]>> {
    try {
      const result = await this.leaderboardRepository.getHistory(filter);

      if (result.isFailure) {
        const errorMessage =
          result.error instanceof Error
            ? result.error.message
            : result.error || 'Geçmiş veriler alınamadı';
        return Result.fail(new AppError(errorMessage, 500));
      }

      return Result.ok(result.value);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Geçmiş veriler alınamadı', 500)
      );
    }
  }
}
