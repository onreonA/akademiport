import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AddLeaderboardScoreUseCase } from './AddLeaderboardScoreUseCase';
import { ILeaderboardRepository } from '@/3-domain/interfaces/repositories/ILeaderboardRepository';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import { Result } from '@/6-core/result/Result';
import { ActivityType } from '@/3-domain/enums/LeaderboardEnums';
import { AddScoreDto } from '@/2-application/dtos/leaderboard';
import type { Company } from '@/3-domain/entities/Company';

describe('AddLeaderboardScoreUseCase', () => {
  let mockLeaderboardRepository: ILeaderboardRepository;
  let mockCompanyRepository: ICompanyRepository;
  let useCase: AddLeaderboardScoreUseCase;

  beforeEach(() => {
    mockLeaderboardRepository = {
      addScore: vi.fn(),
      refreshRankings: vi.fn().mockResolvedValue(Result.ok(undefined)),
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

    mockCompanyRepository = {
      findById: vi.fn(),
    } as any;

    useCase = new AddLeaderboardScoreUseCase(mockLeaderboardRepository, mockCompanyRepository);
  });

  const createMockCompany = (): Company => ({
    id: 'company-1',
    programId: 'program-1',
    name: 'Test Company',
    legalName: 'Test Company Ltd.',
    slug: 'test-company',
    country: 'TR',
    isActive: true,
    maxUsers: 5,
    currentUsers: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  describe('execute', () => {
    it('should add score successfully when company exists', async () => {
      const company = createMockCompany();
      const dto: AddScoreDto = {
        companyId: 'company-1',
        activityType: ActivityType.TASK_COMPLETED,
        activityId: 'task-1',
        points: 10,
        multiplier: 1.0,
        metadata: { taskTitle: 'Test Task' },
      };

      vi.mocked(mockCompanyRepository.findById).mockResolvedValue(Result.ok(company));
      vi.mocked(mockLeaderboardRepository.addScore).mockResolvedValue(Result.ok(undefined));

      const result = await useCase.execute(dto);

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith('company-1');
      expect(mockLeaderboardRepository.addScore).toHaveBeenCalledWith({
        companyId: 'company-1',
        programId: 'program-1',
        activityType: ActivityType.TASK_COMPLETED,
        activityId: 'task-1',
        points: 10,
        multiplier: 1.0,
        metadata: { taskTitle: 'Test Task' },
      });
    });

    it('should calculate points automatically when not provided', async () => {
      const company = createMockCompany();
      const dto: AddScoreDto = {
        companyId: 'company-1',
        activityType: ActivityType.TASK_COMPLETED,
      };

      vi.mocked(mockCompanyRepository.findById).mockResolvedValue(Result.ok(company));
      vi.mocked(mockLeaderboardRepository.addScore).mockResolvedValue(Result.ok(undefined));

      const result = await useCase.execute(dto);

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(mockLeaderboardRepository.addScore).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: 'company-1',
          programId: 'program-1',
          activityType: ActivityType.TASK_COMPLETED,
          points: expect.any(Number),
        })
      );
    });

    it('should fail when company not found', async () => {
      const dto: AddScoreDto = {
        companyId: 'company-1',
        activityType: ActivityType.TASK_COMPLETED,
      };

      vi.mocked(mockCompanyRepository.findById).mockResolvedValue(Result.ok(null));

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Firma bulunamadı');
      expect(mockLeaderboardRepository.addScore).not.toHaveBeenCalled();
    });

    it('should fail when company repository fails', async () => {
      const dto: AddScoreDto = {
        companyId: 'company-1',
        activityType: ActivityType.TASK_COMPLETED,
      };

      vi.mocked(mockCompanyRepository.findById).mockResolvedValue(
        Result.fail(new Error('Database error'))
      );

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(mockLeaderboardRepository.addScore).not.toHaveBeenCalled();
    });

    it('should fail when leaderboard repository fails', async () => {
      const company = createMockCompany();
      const dto: AddScoreDto = {
        companyId: 'company-1',
        activityType: ActivityType.TASK_COMPLETED,
        points: 10,
      };

      vi.mocked(mockCompanyRepository.findById).mockResolvedValue(Result.ok(company));
      vi.mocked(mockLeaderboardRepository.addScore).mockResolvedValue(
        Result.fail('Failed to add score')
      );

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeDefined();
      // Error message should contain 'Puan eklenemedi' or the original error
      expect(
        result.error?.message?.includes('Puan eklenemedi') ||
          result.error?.message?.includes('Failed to add score')
      ).toBe(true);
    });

    it('should use default multiplier when not provided', async () => {
      const company = createMockCompany();
      const dto: AddScoreDto = {
        companyId: 'company-1',
        activityType: ActivityType.TASK_COMPLETED,
        points: 10,
      };

      vi.mocked(mockCompanyRepository.findById).mockResolvedValue(Result.ok(company));
      vi.mocked(mockLeaderboardRepository.addScore).mockResolvedValue(Result.ok(undefined));

      await useCase.execute(dto);

      expect(mockLeaderboardRepository.addScore).toHaveBeenCalledWith(
        expect.objectContaining({
          multiplier: 1.0,
        })
      );
    });
  });
});
