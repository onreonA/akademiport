import { ILeaderboardRepository } from '@/3-domain/interfaces/repositories/ILeaderboardRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { LeaderboardRanking } from '@/3-domain/entities/Leaderboard';

export class GetCompanyRankingUseCase {
  constructor(private leaderboardRepository: ILeaderboardRepository) {}

  async execute(companyId: string, programId: string): Promise<Result<LeaderboardRanking | null>> {
    try {
      const result = await this.leaderboardRepository.getCompanyRanking(companyId, programId);

      if (result.isFailure) {
        const errorMessage = result.error instanceof Error ? result.error.message : (result.error || 'Firma sıralaması alınamadı');
        return Result.fail(new AppError(errorMessage, 500));
      }

      return Result.ok(result.value);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Firma sıralaması alınamadı', 500)
      );
    }
  }
}



