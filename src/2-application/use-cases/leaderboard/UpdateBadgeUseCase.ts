import { ILeaderboardRepository } from '@/3-domain/interfaces/repositories/ILeaderboardRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { UpdateBadgeDto } from '@/2-application/dtos/leaderboard/BadgeDto';
import { Badge } from '@/3-domain/entities/Leaderboard';

export class UpdateBadgeUseCase {
  constructor(private leaderboardRepository: ILeaderboardRepository) {}

  async execute(badgeId: string, dto: UpdateBadgeDto): Promise<Result<Badge>> {
    try {
      const result = await this.leaderboardRepository.updateBadge(badgeId, dto);

      if (result.isFailure) {
        const errorMessage = result.error instanceof Error ? result.error.message : (result.error || 'Rozet güncellenemedi');
        return Result.fail(new AppError(errorMessage, 500));
      }

      return Result.ok(result.value);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Rozet güncellenemedi', 500)
      );
    }
  }
}



