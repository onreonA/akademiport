import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetLeaderboardUseCase } from './GetLeaderboardUseCase';
import { ILeaderboardRepository } from '@/3-domain/interfaces/repositories/ILeaderboardRepository';
import { Result } from '@/6-core/result/Result';
import type { LeaderboardRanking } from '@/3-domain/entities/Leaderboard';
import { LeaderboardFilterDto } from '@/2-application/dtos/leaderboard';

describe('GetLeaderboardUseCase', () => {
  let mockRepository: ILeaderboardRepository;
  let useCase: GetLeaderboardUseCase;

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

    useCase = new GetLeaderboardUseCase(mockRepository);
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
    it('should get leaderboard rankings successfully', async () => {
      const rankings = [createMockRanking()];
      const filter: LeaderboardFilterDto = {
        programId: 'program-1',
        limit: 50,
      };

      vi.mocked(mockRepository.getRankings).mockResolvedValue(Result.ok(rankings));

      const result = await useCase.execute(filter);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(rankings);
      expect(mockRepository.getRankings).toHaveBeenCalledWith(filter);
    });

    it('should get leaderboard without filter', async () => {
      const rankings = [createMockRanking()];

      vi.mocked(mockRepository.getRankings).mockResolvedValue(Result.ok(rankings));

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(rankings);
      expect(mockRepository.getRankings).toHaveBeenCalledWith(undefined);
    });

    it('should fail when repository fails', async () => {
      const filter: LeaderboardFilterDto = {
        programId: 'program-1',
      };

      vi.mocked(mockRepository.getRankings).mockResolvedValue(
        Result.fail('Database error')
      );

      const result = await useCase.execute(filter);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeDefined();
      // Error message should contain 'Liderlik tablosu alınamadı' or the original error
      expect(
        result.error?.message?.includes('Liderlik tablosu alınamadı') ||
          result.error?.message?.includes('Database error')
      ).toBe(true);
    });

    it('should handle empty rankings', async () => {
      vi.mocked(mockRepository.getRankings).mockResolvedValue(Result.ok([]));

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual([]);
    });
  });
});

