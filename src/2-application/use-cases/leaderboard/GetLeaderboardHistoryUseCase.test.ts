import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetLeaderboardHistoryUseCase } from './GetLeaderboardHistoryUseCase';
import { ILeaderboardRepository } from '@/3-domain/interfaces/repositories/ILeaderboardRepository';
import { Result } from '@/6-core/result/Result';
import type { LeaderboardHistory } from '@/3-domain/entities/Leaderboard';

describe('GetLeaderboardHistoryUseCase', () => {
  let mockRepository: ILeaderboardRepository;
  let useCase: GetLeaderboardHistoryUseCase;

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

    useCase = new GetLeaderboardHistoryUseCase(mockRepository);
  });

  const createMockHistory = (): LeaderboardHistory => ({
    id: 'history-1',
    companyId: 'company-1',
    programId: 'program-1',
    snapshotDate: new Date('2024-01-01'),
    totalScore: 1000,
    projectScore: 500,
    trainingScore: 200,
    eventScore: 150,
    forumScore: 100,
    newsScore: 50,
    appointmentScore: 0,
    rank: 1,
    badgeCount: 5,
    createdAt: new Date(),
  });

  describe('execute', () => {
    it('should get leaderboard history successfully', async () => {
      const history = [createMockHistory()];

      vi.mocked(mockRepository.getHistory).mockResolvedValue(Result.ok(history));

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(history);
      expect(mockRepository.getHistory).toHaveBeenCalledWith(undefined);
    });

    it('should get history with company filter', async () => {
      const history = [createMockHistory()];
      const filter = {
        companyId: 'company-1',
      };

      vi.mocked(mockRepository.getHistory).mockResolvedValue(Result.ok(history));

      const result = await useCase.execute(filter);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(history);
      expect(mockRepository.getHistory).toHaveBeenCalledWith(filter);
    });

    it('should get history with date range filter', async () => {
      const history = [createMockHistory()];
      const filter = {
        companyId: 'company-1',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      };

      vi.mocked(mockRepository.getHistory).mockResolvedValue(Result.ok(history));

      const result = await useCase.execute(filter);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(history);
      expect(mockRepository.getHistory).toHaveBeenCalledWith(filter);
    });

    it('should return empty array when no history found', async () => {
      vi.mocked(mockRepository.getHistory).mockResolvedValue(Result.ok([]));

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual([]);
    });

    it('should fail when repository fails', async () => {
      vi.mocked(mockRepository.getHistory).mockResolvedValue(Result.fail('Database error'));

      const result = await useCase.execute();

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeDefined();
      expect(
        result.error?.message?.includes('Geçmiş veriler alınamadı') ||
          result.error?.message?.includes('Database error')
      ).toBe(true);
    });

    it('should return multiple history entries', async () => {
      const history: LeaderboardHistory[] = [
        createMockHistory(),
        {
          ...createMockHistory(),
          id: 'history-2',
          snapshotDate: new Date('2024-01-08'),
          totalScore: 1200,
          rank: 1,
        },
        {
          ...createMockHistory(),
          id: 'history-3',
          snapshotDate: new Date('2024-01-15'),
          totalScore: 1500,
          rank: 1,
        },
      ];

      vi.mocked(mockRepository.getHistory).mockResolvedValue(Result.ok(history));

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toHaveLength(3);
    });
  });
});
