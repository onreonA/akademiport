import { ILeaderboardRepository } from '@/3-domain/interfaces/repositories/ILeaderboardRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { CreateBadgeDto } from '@/2-application/dtos/leaderboard/BadgeDto';
import { Badge } from '@/3-domain/entities/Leaderboard';

export class CreateBadgeUseCase {
  constructor(private leaderboardRepository: ILeaderboardRepository) {}

  async execute(dto: CreateBadgeDto): Promise<Result<Badge>> {
    try {
      const badgeData: Omit<Badge, 'id' | 'createdAt' | 'updatedAt'> = {
        name: dto.name,
        description: dto.description || null,
        icon: dto.icon || null,
        category: dto.category,
        requirementType: dto.requirementType,
        requirementValue: dto.requirementValue,
        requirementActivity: dto.requirementActivity || null,
        pointsBonus: dto.pointsBonus || 0,
        isActive: dto.isActive ?? true,
        orderIndex: dto.orderIndex || 0,
      };

      const result = await this.leaderboardRepository.createBadge(badgeData);

      if (result.isFailure) {
        const errorMessage =
          result.error instanceof Error
            ? result.error.message
            : result.error || 'Rozet oluşturulamadı';
        return Result.fail(new AppError(errorMessage, 500));
      }

      return Result.ok(result.value);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Rozet oluşturulamadı', 500)
      );
    }
  }
}
