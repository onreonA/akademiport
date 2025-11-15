import { ILeaderboardRepository } from '@/3-domain/interfaces/repositories/ILeaderboardRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { CompanyBadge } from '@/3-domain/entities/Leaderboard';

export class GetCompanyBadgesUseCase {
  constructor(private leaderboardRepository: ILeaderboardRepository) {}

  async execute(companyId: string): Promise<Result<CompanyBadge[]>> {
    try {
      const result = await this.leaderboardRepository.getCompanyBadges(companyId);

      if (result.isFailure) {
        const errorMessage = result.error instanceof Error ? result.error.message : (result.error || 'Firma rozetleri alınamadı');
        return Result.fail(new AppError(errorMessage, 500));
      }

      return Result.ok(result.value);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Firma rozetleri alınamadı', 500)
      );
    }
  }
}



