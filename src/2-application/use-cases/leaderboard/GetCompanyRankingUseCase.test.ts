import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetCompanyRankingUseCase } from './GetCompanyRankingUseCase';
import { ILeaderboardRepository } from '@/3-domain/interfaces/repositories/ILeaderboardRepository';
import { Result } from '@/6-core/result/Result';
import type { LeaderboardRanking } from '@/3-domain/entities/Leaderboard';

describe('GetCompanyRankingUseCase', () => {
  let mockRepository: ILeaderboardRepository;
  let useCase: GetCompanyRankingUseCase;

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

    useCase = new GetCompanyRankingUseCase(mockRepository);
  });

  const createMockRanking = (): LeaderboardRanking => ({
    companyId: 'company-1',
    companyName: 'Test Company',
    programId: 'program-1',
    totalScore: 1000,
    projectScore: 500,
    trainingScore: 200,
    eventScore: 150,
    forumScore: 100,
    newsScore: 50,
    appointmentScore: 0,
    rank: 1,
    badgeCount: 5,
    lastActivityAt: new Date(),
  });

  describe('execute', () => {
    it('should get company ranking successfully', async () => {
      const ranking = createMockRanking();

      vi.mocked(mockRepository.getCompanyRanking).mockResolvedValue(Result.ok(ranking));

      const result = await useCase.execute('company-1', 'program-1');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(ranking);
      expect(mockRepository.getCompanyRanking).toHaveBeenCalledWith('company-1', 'program-1');
    });

    it('should return null when company has no ranking', async () => {
      vi.mocked(mockRepository.getCompanyRanking).mockResolvedValue(Result.ok(null));

      const result = await useCase.execute('company-1', 'program-1');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeNull();
    });

    it('should fail when repository fails', async () => {
      vi.mocked(mockRepository.getCompanyRanking).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute('company-1', 'program-1');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeDefined();
      // Error message should contain 'Firma sıralaması alınamadı' or the original error
      expect(
        result.error?.message?.includes('Firma sıralaması alınamadı') ||
          result.error?.message?.includes('Database error')
      ).toBe(true);
    });
  });
});
