import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetCompanyBadgesUseCase } from './GetCompanyBadgesUseCase';
import { ILeaderboardRepository } from '@/3-domain/interfaces/repositories/ILeaderboardRepository';
import { Result } from '@/6-core/result/Result';
import { BadgeCategory, RequirementType } from '@/3-domain/enums/LeaderboardEnums';
import type { CompanyBadge, Badge } from '@/3-domain/entities/Leaderboard';

describe('GetCompanyBadgesUseCase', () => {
  let mockRepository: ILeaderboardRepository;
  let useCase: GetCompanyBadgesUseCase;

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

    useCase = new GetCompanyBadgesUseCase(mockRepository);
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

  const createMockCompanyBadge = (): CompanyBadge => ({
    id: 'company-badge-1',
    companyId: 'company-1',
    badgeId: 'badge-1',
    earnedAt: new Date(),
    badge: createMockBadge(),
  });

  describe('execute', () => {
    it('should get company badges successfully', async () => {
      const companyBadges = [createMockCompanyBadge()];

      vi.mocked(mockRepository.getCompanyBadges).mockResolvedValue(Result.ok(companyBadges));

      const result = await useCase.execute('company-1');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(companyBadges);
      expect(mockRepository.getCompanyBadges).toHaveBeenCalledWith('company-1');
    });

    it('should return empty array when company has no badges', async () => {
      vi.mocked(mockRepository.getCompanyBadges).mockResolvedValue(Result.ok([]));

      const result = await useCase.execute('company-1');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual([]);
    });

    it('should fail when repository fails', async () => {
      vi.mocked(mockRepository.getCompanyBadges).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute('company-1');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeDefined();
      expect(
        result.error?.message?.includes('Firma rozetleri alınamadı') ||
          result.error?.message?.includes('Database error')
      ).toBe(true);
    });

    it('should return multiple badges for company', async () => {
      const companyBadges: CompanyBadge[] = [
        createMockCompanyBadge(),
        {
          id: 'company-badge-2',
          companyId: 'company-1',
          badgeId: 'badge-2',
          earnedAt: new Date(),
          badge: {
            ...createMockBadge(),
            id: 'badge-2',
            name: 'İkinci Adım',
          },
        },
      ];

      vi.mocked(mockRepository.getCompanyBadges).mockResolvedValue(Result.ok(companyBadges));

      const result = await useCase.execute('company-1');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toHaveLength(2);
    });
  });
});
