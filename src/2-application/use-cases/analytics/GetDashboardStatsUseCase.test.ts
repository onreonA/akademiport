/**
 * Unit Tests for GetDashboardStatsUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetDashboardStatsUseCase } from './GetDashboardStatsUseCase';
import { Result } from '@/6-core/result/Result';
import { setupTestIsolation } from '@/shared/test/test-isolation';

// Mock repositories
const mockUserRepository = {
  findAll: vi.fn(),
  findByProgramId: vi.fn(),
};

const mockCompanyRepository = {
  findAll: vi.fn(),
  findByProgramId: vi.fn(),
};

const mockProgramRepository = {
  findAll: vi.fn(),
};

const mockProjectRepository = {
  findAll: vi.fn(),
};

const mockTaskRepository = {
  findAll: vi.fn(),
};

// Mock Supabase client
vi.mock('@/4-infrastructure/database/supabase-server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn((callback) => {
        return Promise.resolve(
          callback({
            data: [
              {
                created_at: new Date().toISOString(),
                status: 'completed',
              },
              {
                created_at: new Date(Date.now() - 86400000).toISOString(),
                status: 'pending',
              },
            ],
            error: null,
          })
        );
      }),
    })),
  }),
}));

describe('GetDashboardStatsUseCase', () => {
  let useCase: GetDashboardStatsUseCase;

  setupTestIsolation();

  beforeEach(() => {
    vi.clearAllMocks();

    useCase = new GetDashboardStatsUseCase(
      mockUserRepository as any,
      mockCompanyRepository as any,
      mockProgramRepository as any,
      mockProjectRepository as any,
      mockTaskRepository as any
    );
  });

  describe('execute', () => {
    it('should return dashboard stats successfully', async () => {
      // Mock repository responses
      mockProgramRepository.findAll.mockResolvedValue(
        Result.ok([
          { id: 'program-1', name: 'Program 1' },
          { id: 'program-2', name: 'Program 2' },
        ])
      );

      mockCompanyRepository.findAll.mockResolvedValue(
        Result.ok([
          { id: 'company-1', name: 'Company 1', isActive: true },
          { id: 'company-2', name: 'Company 2', isActive: false },
        ])
      );

      mockUserRepository.findAll.mockResolvedValue(
        Result.ok([
          { id: 'user-1', email: 'user1@example.com' },
          { id: 'user-2', email: 'user2@example.com' },
        ])
      );

      mockCompanyRepository.findByProgramId.mockResolvedValue(Result.ok([{ id: 'company-1' }]));

      mockProjectRepository.findAll.mockResolvedValue({
        data: [
          { id: 'project-1', programId: 'program-1', status: 'done' },
          { id: 'project-2', programId: 'program-1', status: 'in_progress' },
        ],
      });

      mockUserRepository.findByProgramId.mockResolvedValue(Result.ok([{ id: 'user-1' }]));

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.totalPrograms).toBe(2);
        expect(result.value.activeCompanies).toBe(1);
        expect(result.value.totalUsers).toBe(2);
        expect(result.value.userGrowth).toBeDefined();
        expect(result.value.programActivity).toBeDefined();
        expect(result.value.companyDistribution).toBeDefined();
        expect(result.value.taskCompletion).toBeDefined();
      }
    });

    it('should handle repository failures gracefully', async () => {
      mockProgramRepository.findAll.mockResolvedValue(Result.fail('Database error'));

      mockCompanyRepository.findAll.mockResolvedValue(Result.ok([]));
      mockUserRepository.findAll.mockResolvedValue(Result.ok([]));

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.totalPrograms).toBe(0);
        expect(result.value.activeCompanies).toBe(0);
        expect(result.value.totalUsers).toBe(0);
      }
    });

    it('should calculate monthly growth correctly', async () => {
      mockProgramRepository.findAll.mockResolvedValue(Result.ok([]));
      mockCompanyRepository.findAll.mockResolvedValue(Result.ok([]));
      mockUserRepository.findAll.mockResolvedValue(Result.ok([]));

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.monthlyGrowth).toBeDefined();
        expect(typeof result.value.monthlyGrowth).toBe('number');
      }
    });

    it('should return task completion data', async () => {
      mockProgramRepository.findAll.mockResolvedValue(Result.ok([]));
      mockCompanyRepository.findAll.mockResolvedValue(Result.ok([]));
      mockUserRepository.findAll.mockResolvedValue(Result.ok([]));

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.taskCompletion).toBeDefined();
        expect(Array.isArray(result.value.taskCompletion)).toBe(true);
        expect(result.value.completedTasks).toBeDefined();
        expect(result.value.pendingTasks).toBeDefined();
      }
    });

    it('should handle errors and return failure result', async () => {
      mockProgramRepository.findAll.mockRejectedValue(new Error('Unexpected error'));

      const result = await useCase.execute();

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBeDefined();
      }
    });
  });
});

