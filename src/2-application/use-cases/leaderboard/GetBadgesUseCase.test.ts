import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetBadgesUseCase } from './GetBadgesUseCase';
import { ILeaderboardRepository } from '@/3-domain/interfaces/repositories/ILeaderboardRepository';
import { Result } from '@/6-core/result/Result';
import type { Badge } from '@/3-domain/entities/Leaderboard';
import { BadgeCategory, RequirementType } from '@/3-domain/enums/LeaderboardEnums';

describe('GetBadgesUseCase', () => {
  let mockRepository: ILeaderboardRepository;
  let useCase: GetBadgesUseCase;

  beforeEach(() => {
    mockRepository = {
      addScore: vi.fn(),
      refreshRankings: vi.fn(),
      getRankings: vi.fn(),
      getCompanyRanking: vi.fn(),
      getBadges: vi.fn(),
      getBadgeById: vi.fn(),
      createBadge: vi.fn(),
      updateBadge: vi.fn(),
      deleteBadge: vi.fn(),
      getCompanyBadges: vi.fn(),
      getCompanyScores: vi.fn(),
      getHistory: vi.fn(),
      createSnapshot: vi.fn(),
      getCompanyTrend: vi.fn(),
    } as any;

    useCase = new GetBadgesUseCase(mockRepository);
  });

  const createMockBadge = (): Badge => ({
    id: 'badge-1',
    name: 'İlk Adım',
    description: 'İlk görevini tamamladın!',
    icon: '🎯',
    category: BadgeCategory.PROJECT,
    requirementType: RequirementType.COUNT,
    requirementValue: 1,
    requirementActivity: 'task_completed',
    pointsBonus: 10,
    isActive: true,
    orderIndex: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  describe('execute', () => {
    it('should get badges successfully', async () => {
      const badges = [createMockBadge()];

      vi.mocked(mockRepository.getBadges).mockResolvedValue(Result.ok(badges));

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(badges);
      expect(mockRepository.getBadges).toHaveBeenCalledWith(undefined);
    });

    it('should get badges with filter', async () => {
      const badges = [createMockBadge()];
      const filter = {
        category: BadgeCategory.PROJECT,
        isActive: true,
      };

      vi.mocked(mockRepository.getBadges).mockResolvedValue(Result.ok(badges));

      const result = await useCase.execute(filter);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(badges);
      expect(mockRepository.getBadges).toHaveBeenCalledWith(filter);
    });

    it('should fail when repository fails', async () => {
      vi.mocked(mockRepository.getBadges).mockResolvedValue(
        Result.fail('Database error')
      );

      const result = await useCase.execute();

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeDefined();
      // Error message should contain 'Rozetler alınamadı' or the original error
      expect(
        result.error?.message?.includes('Rozetler alınamadı') ||
          result.error?.message?.includes('Database error')
      ).toBe(true);
    });

    it('should handle empty badges', async () => {
      vi.mocked(mockRepository.getBadges).mockResolvedValue(Result.ok([]));

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual([]);
    });
  });
});

