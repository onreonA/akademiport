import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateBadgeUseCase } from './CreateBadgeUseCase';
import { ILeaderboardRepository } from '@/3-domain/interfaces/repositories/ILeaderboardRepository';
import { Result } from '@/6-core/result/Result';
import { CreateBadgeDto } from '@/2-application/dtos/leaderboard';
import { BadgeCategory, RequirementType } from '@/3-domain/enums/LeaderboardEnums';
import type { Badge } from '@/3-domain/entities/Leaderboard';

describe('CreateBadgeUseCase', () => {
  let mockRepository: ILeaderboardRepository;
  let useCase: CreateBadgeUseCase;

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

    useCase = new CreateBadgeUseCase(mockRepository);
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
    it('should create badge successfully', async () => {
      const dto: CreateBadgeDto = {
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
      };

      const createdBadge = createMockBadge();
      vi.mocked(mockRepository.createBadge).mockResolvedValue(Result.ok(createdBadge));

      const result = await useCase.execute(dto);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(createdBadge);
      expect(mockRepository.createBadge).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'İlk Adım',
          category: BadgeCategory.PROJECT,
          requirementType: RequirementType.COUNT,
          requirementValue: 1,
        })
      );
    });

    it('should create badge with optional fields', async () => {
      const dto: CreateBadgeDto = {
        name: 'Test Badge',
        category: BadgeCategory.GENERAL,
        requirementType: RequirementType.THRESHOLD,
        requirementValue: 100,
      };

      const createdBadge: Badge = {
        id: 'badge-2',
        name: 'Test Badge',
        description: null,
        icon: null,
        category: BadgeCategory.GENERAL,
        requirementType: RequirementType.THRESHOLD,
        requirementValue: 100,
        requirementActivity: null,
        pointsBonus: 0,
        isActive: true,
        orderIndex: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockRepository.createBadge).mockResolvedValue(Result.ok(createdBadge));

      const result = await useCase.execute(dto);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.createBadge).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Badge',
          description: null,
          icon: null,
          requirementActivity: null,
          pointsBonus: 0,
          isActive: true,
          orderIndex: 0,
        })
      );
    });

    it('should fail when repository fails', async () => {
      const dto: CreateBadgeDto = {
        name: 'Test Badge',
        category: BadgeCategory.GENERAL,
        requirementType: RequirementType.THRESHOLD,
        requirementValue: 100,
      };

      vi.mocked(mockRepository.createBadge).mockResolvedValue(
        Result.fail('Database error')
      );

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeDefined();
      // Error message should contain 'Rozet oluşturulamadı' or the original error
      expect(
        result.error?.message?.includes('Rozet oluşturulamadı') ||
          result.error?.message?.includes('Database error')
      ).toBe(true);
    });
  });
});

