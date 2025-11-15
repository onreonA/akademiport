import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateBadgeUseCase } from './UpdateBadgeUseCase';
import { ILeaderboardRepository } from '@/3-domain/interfaces/repositories/ILeaderboardRepository';
import { Result } from '@/6-core/result/Result';
import { UpdateBadgeDto } from '@/2-application/dtos/leaderboard';
import { BadgeCategory, RequirementType } from '@/3-domain/enums/LeaderboardEnums';
import type { Badge } from '@/3-domain/entities/Leaderboard';

describe('UpdateBadgeUseCase', () => {
  let mockRepository: ILeaderboardRepository;
  let useCase: UpdateBadgeUseCase;

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

    useCase = new UpdateBadgeUseCase(mockRepository);
  });

  const createMockBadge = (): Badge => ({
    id: 'badge-1',
    name: 'Updated Badge',
    description: 'Updated description',
    icon: '🏆',
    category: BadgeCategory.PROJECT,
    requirementType: RequirementType.COUNT,
    requirementValue: 5,
    requirementActivity: 'task_completed',
    pointsBonus: 20,
    isActive: true,
    orderIndex: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  describe('execute', () => {
    it('should update badge successfully', async () => {
      const dto: UpdateBadgeDto = {
        name: 'Updated Badge',
        description: 'Updated description',
        icon: '🏆',
        category: BadgeCategory.PROJECT,
        requirementType: RequirementType.COUNT,
        requirementValue: 5,
        requirementActivity: 'task_completed',
        pointsBonus: 20,
        isActive: true,
        orderIndex: 2,
      };

      const updatedBadge = createMockBadge();
      vi.mocked(mockRepository.updateBadge).mockResolvedValue(Result.ok(updatedBadge));

      const result = await useCase.execute('badge-1', dto);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(updatedBadge);
      expect(mockRepository.updateBadge).toHaveBeenCalledWith('badge-1', dto);
    });

    it('should update badge with partial data', async () => {
      const dto: UpdateBadgeDto = {
        name: 'New Name',
        isActive: false,
      };

      const updatedBadge: Badge = {
        id: 'badge-1',
        name: 'New Name',
        description: 'Original description',
        icon: '🎯',
        category: BadgeCategory.PROJECT,
        requirementType: RequirementType.COUNT,
        requirementValue: 1,
        requirementActivity: 'task_completed',
        pointsBonus: 10,
        isActive: false,
        orderIndex: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockRepository.updateBadge).mockResolvedValue(Result.ok(updatedBadge));

      const result = await useCase.execute('badge-1', dto);

      expect(result.isSuccess).toBe(true);
      expect(result.value.isActive).toBe(false);
      expect(result.value.name).toBe('New Name');
    });

    it('should fail when repository fails', async () => {
      const dto: UpdateBadgeDto = {
        name: 'Updated Badge',
      };

      vi.mocked(mockRepository.updateBadge).mockResolvedValue(
        Result.fail('Database error')
      );

      const result = await useCase.execute('badge-1', dto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeDefined();
      expect(
        result.error?.message?.includes('Rozet güncellenemedi') ||
          result.error?.message?.includes('Database error')
      ).toBe(true);
    });

    it('should fail when badge not found', async () => {
      const dto: UpdateBadgeDto = {
        name: 'Updated Badge',
      };

      vi.mocked(mockRepository.updateBadge).mockResolvedValue(
        Result.fail('Badge not found')
      );

      const result = await useCase.execute('non-existent-badge', dto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeDefined();
    });
  });
});



