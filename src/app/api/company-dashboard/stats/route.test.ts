/**
 * Integration Tests for GET /api/company-dashboard/stats
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
vi.mock('@/4-infrastructure/database/repositories/ProjectRepository', () => ({
  ProjectRepository: class {
    findAll = vi.fn();
  },
}));

vi.mock('@/4-infrastructure/database/repositories/TrainingRepository', () => ({
  TrainingRepository: class {
    findAll = vi.fn();
  },
}));

vi.mock('@/4-infrastructure/database/repositories/CompanyTrainingRepository', () => ({
  CompanyTrainingRepository: class {
    findByCompanyId = vi.fn();
  },
}));

vi.mock('@/4-infrastructure/database/repositories/EventRepository', () => ({
  EventRepository: class {
    findAll = vi.fn();
  },
}));

vi.mock('@/4-infrastructure/database/repositories/SupabaseEcommerceRepository', () => ({
  SupabaseEcommerceRepository: class {
    listMetrics = vi.fn();
  },
}));

const mockExecute = vi.fn();
vi.mock('@/2-application/use-cases/analytics/GetCompanyDashboardStatsUseCase', () => ({
  GetCompanyDashboardStatsUseCase: class {
    execute = mockExecute;
  },
}));

describe('GET /api/company-dashboard/stats', () => {
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

  const createMockRequest = (searchParams: Record<string, string> = {}) => {
    const url = new URL('http://localhost/api/company-dashboard/stats');
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return new NextRequest(url);
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

    it('should return 404 when user data is not found', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'user@example.com' } },
      });
      mockSingle.mockResolvedValue({ data: null });

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Kullanıcı bulunamadı');
    });
  });

  describe('authorization', () => {
    it('should allow access for company users with matching companyId', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'user@example.com' } },
      });
      mockSingle.mockResolvedValue({
        data: { role: 'company_admin', company_id: 'company-1' },
      });

      const mockStats = {
        totalProjects: 5,
        completedProjects: 2,
        activeProjects: 3,
        totalTrainings: 10,
        completedTrainings: 5,
        totalEvents: 3,
        upcomingEvents: 1,
        projectProgress: [],
        trainingProgress: [],
        ecommerceMetrics: [],
      };

      mockExecute.mockResolvedValue(Result.ok(mockStats));

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockStats);
      expect(mockExecute).toHaveBeenCalledWith('company-1');
    });

    it('should allow access for master_admin', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'admin@example.com' } },
      });
      mockSingle.mockResolvedValue({
        data: { role: 'master_admin', company_id: null },
      });

      const mockStats = {
        totalProjects: 10,
        completedProjects: 5,
        activeProjects: 5,
        totalTrainings: 20,
        completedTrainings: 10,
        totalEvents: 5,
        upcomingEvents: 2,
        projectProgress: [],
        trainingProgress: [],
        ecommerceMetrics: [],
      };

      mockExecute.mockResolvedValue(Result.ok(mockStats));

      const request = createMockRequest({ companyId: 'company-2' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockExecute).toHaveBeenCalledWith('company-2');
    });

    it('should return 403 when company user tries to access different company', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'user@example.com' } },
      });
      mockSingle.mockResolvedValue({
        data: { role: 'company_admin', company_id: 'company-1' },
      });

      const request = createMockRequest({ companyId: 'company-2' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Bu işlem için yetkiniz yok');
    });

    it('should return 400 when companyId is missing', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'user@example.com' } },
      });
      mockSingle.mockResolvedValue({
        data: { role: 'company_admin', company_id: null },
      });

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Firma ID gerekli');
    });
  });

  describe('use case execution', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'user@example.com' } },
      });
      mockSingle.mockResolvedValue({
        data: { role: 'company_admin', company_id: 'company-1' },
      });
    });

    it('should return company dashboard stats successfully', async () => {
      const mockStats = {
        totalProjects: 5,
        completedProjects: 2,
        activeProjects: 3,
        totalTrainings: 10,
        completedTrainings: 5,
        totalEvents: 3,
        upcomingEvents: 1,
        projectProgress: [
          { projectName: 'Project 1', progress: 100, status: 'done' },
          { projectName: 'Project 2', progress: 50, status: 'in_progress' },
        ],
        trainingProgress: [{ trainingName: 'Training 1', progress: 100, completed: true }],
        ecommerceMetrics: [{ month: '2025-12', revenue: 10000, orders: 50, visitors: 500 }],
      };

      mockExecute.mockResolvedValue(Result.ok(mockStats));

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.totalProjects).toBe(5);
      expect(data.data.completedProjects).toBe(2);
      expect(data.data.activeProjects).toBe(3);
    });

    it('should return 400 when use case fails', async () => {
      mockExecute.mockResolvedValue(Result.fail('Failed to fetch company stats'));

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Failed to fetch company stats');
    });

    it('should return 500 when an error occurs', async () => {
      mockExecute.mockRejectedValue(new Error('Database connection error'));

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Company dashboard istatistikleri alınamadı');
    });
  });
});

