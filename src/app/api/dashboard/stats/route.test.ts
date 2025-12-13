/**
 * Integration Tests for GET /api/dashboard/stats
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';
import { Result } from '@/6-core/result/Result';
import { setupTestIsolation } from '@/shared/test/test-isolation';

// Mock Supabase client - use factory function to avoid hoisting issues
vi.mock('@/4-infrastructure/database/supabase-server', () => {
  const mockGetUser = vi.fn();
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockSingle = vi.fn();

  return {
    createClient: vi.fn().mockResolvedValue({
      auth: {
        getUser: mockGetUser,
      },
      from: vi.fn(() => ({
        select: mockSelect.mockReturnThis(),
        eq: mockEq.mockReturnThis(),
        single: mockSingle,
      })),
    }),
    // Export mocks for use in tests
    __mocks: {
      mockGetUser,
      mockSelect,
      mockEq,
      mockSingle,
    },
  };
});

// Mock repositories - use class pattern
vi.mock('@/4-infrastructure/database/repositories/UserRepository', () => ({
  UserRepository: class {
    findAll = vi.fn();
    findByProgramId = vi.fn();
  },
}));

vi.mock('@/4-infrastructure/database/repositories/CompanyRepository', () => ({
  CompanyRepository: class {
    findAll = vi.fn();
    findByProgramId = vi.fn();
  },
}));

vi.mock('@/4-infrastructure/database/repositories/ProgramRepository', () => ({
  ProgramRepository: class {
    findAll = vi.fn();
  },
}));

vi.mock('@/4-infrastructure/database/repositories/ProjectRepository', () => ({
  ProjectRepository: class {
    findAll = vi.fn();
  },
}));

vi.mock('@/4-infrastructure/database/repositories/TaskRepository', () => ({
  TaskRepository: class {
    findAll = vi.fn();
  },
}));

const mockExecute = vi.fn();
vi.mock('@/2-application/use-cases/analytics/GetDashboardStatsUseCase', () => ({
  GetDashboardStatsUseCase: class {
    execute = mockExecute;
  },
}));

describe('GET /api/dashboard/stats', () => {
  setupTestIsolation();

  let mockGetUser: ReturnType<typeof vi.fn>;
  let mockSingle: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Get mocks from the mocked module
    const supabaseModule = await import('@/4-infrastructure/database/supabase-server');
    const mocks = (supabaseModule as any).__mocks;
    if (mocks) {
      mockGetUser = mocks.mockGetUser;
      mockSingle = mocks.mockSingle;
    }
  });

  const createMockRequest = () => {
    return new NextRequest('http://localhost/api/dashboard/stats');
  };

  describe('authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Yetkisiz erişim');
    });

    it('should return 403 when user is not master_admin', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'user@example.com' } },
      });
      mockSingle.mockResolvedValue({
        data: { role: 'company_admin' },
      });

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Bu işlem için yetkiniz yok');
    });
  });

  describe('authorization', () => {
    it('should allow access for master_admin', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'admin@example.com' } },
      });
      mockSingle.mockResolvedValue({
        data: { role: 'master_admin' },
      });

      const mockStats = {
        totalPrograms: 5,
        activeCompanies: 10,
        totalUsers: 50,
        completedTasks: 100,
        pendingTasks: 20,
        monthlyGrowth: 15.5,
        userGrowth: [],
        programActivity: [],
        companyDistribution: [],
        taskCompletion: [],
      };

      mockExecute.mockResolvedValue(Result.ok(mockStats));

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockStats);
    });
  });

  describe('use case execution', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'admin@example.com' } },
      });
      mockSingle.mockResolvedValue({
        data: { role: 'master_admin' },
      });
    });

    it('should return dashboard stats successfully', async () => {
      const mockStats = {
        totalPrograms: 3,
        activeCompanies: 8,
        totalUsers: 45,
        completedTasks: 150,
        pendingTasks: 30,
        monthlyGrowth: 12.5,
        userGrowth: [
          { month: '2025-01', users: 40, growth: 5.0 },
          { month: '2025-02', users: 45, growth: 12.5 },
        ],
        programActivity: [{ programName: 'Program 1', companies: 5, projects: 10, users: 20 }],
        companyDistribution: [
          { name: 'Aktif', value: 8 },
          { name: 'Pasif', value: 2 },
        ],
        taskCompletion: [
          { date: '2025-12-01', completed: 10, pending: 5, total: 15, completionRate: 66.67 },
        ],
      };

      mockExecute.mockResolvedValue(Result.ok(mockStats));

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.totalPrograms).toBe(3);
      expect(data.data.activeCompanies).toBe(8);
      expect(data.data.totalUsers).toBe(45);
    });

    it('should return 400 when use case fails', async () => {
      mockExecute.mockResolvedValue(Result.fail('Failed to fetch dashboard stats'));

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Failed to fetch dashboard stats');
    });

    it('should return 500 when an error occurs', async () => {
      mockExecute.mockRejectedValue(new Error('Database connection error'));

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Dashboard istatistikleri alınamadı');
    });
  });
});
