import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteBadgeUseCase } from './DeleteBadgeUseCase';
import { ILeaderboardRepository } from '@/3-domain/interfaces/repositories/ILeaderboardRepository';
import { Result } from '@/6-core/result/Result';

describe('DeleteBadgeUseCase', () => {
  let mockRepository: ILeaderboardRepository;
  let useCase: DeleteBadgeUseCase;

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

    useCase = new DeleteBadgeUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should delete badge successfully', async () => {
      vi.mocked(mockRepository.deleteBadge).mockResolvedValue(Result.ok(undefined));

      const result = await useCase.execute('badge-1');

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(mockRepository.deleteBadge).toHaveBeenCalledWith('badge-1');
    });

    it('should fail when repository fails', async () => {
      vi.mocked(mockRepository.deleteBadge).mockResolvedValue(
        Result.fail('Database error')
      );

      const result = await useCase.execute('badge-1');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeDefined();
      expect(
        result.error?.message?.includes('Rozet silinemedi') ||
          result.error?.message?.includes('Database error')
      ).toBe(true);
    });

    it('should fail when badge not found', async () => {
      vi.mocked(mockRepository.deleteBadge).mockResolvedValue(
        Result.fail('Badge not found')
      );

      const result = await useCase.execute('non-existent-badge');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeDefined();
    });

    it('should fail when badge is in use', async () => {
      vi.mocked(mockRepository.deleteBadge).mockResolvedValue(
        Result.fail('Badge is in use by companies')
      );

      const result = await useCase.execute('badge-1');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeDefined();
    });
  });
});



