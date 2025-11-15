import { ILeaderboardRepository } from '@/3-domain/interfaces/repositories/ILeaderboardRepository';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { AddScoreDto } from '@/2-application/dtos/leaderboard/AddScoreDto';
import { getPointsForActivity } from '@/5-shared/constants/leaderboard';

export class AddLeaderboardScoreUseCase {
  constructor(
    private leaderboardRepository: ILeaderboardRepository,
    private companyRepository: ICompanyRepository
  ) {}

  async execute(data: AddScoreDto): Promise<Result<void>> {
    try {
      // Get company to find program_id
      const companyResult = await this.companyRepository.findById(data.companyId);
      if (companyResult.isFailure || !companyResult.value) {
        return Result.fail(new AppError('Firma bulunamadı', 404));
      }

      const company = companyResult.value;

      // Calculate points if not provided
      const points = data.points ?? getPointsForActivity(data.activityType);

      // Add score using repository
      const result = await this.leaderboardRepository.addScore({
        companyId: data.companyId,
        programId: company.programId,
        activityType: data.activityType,
        activityId: data.activityId || null,
        points,
        multiplier: data.multiplier || 1.0,
        metadata: data.metadata || null,
      });

      if (result.isFailure) {
        const errorMessage = result.error instanceof Error ? result.error.message : (result.error || 'Puan eklenemedi');
        return Result.fail(new AppError(errorMessage, 500));
      }

      // Refresh leaderboard (async, don't wait)
      this.leaderboardRepository.refreshRankings().catch((error) => {
        console.error('Failed to refresh leaderboard:', error);
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Puan eklenemedi', 500)
      );
    }
  }
}

