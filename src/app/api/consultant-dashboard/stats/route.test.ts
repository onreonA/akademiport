/**
 * Integration Tests for GET /api/consultant-dashboard/stats
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
  },
}));

vi.mock('@/4-infrastructure/database/repositories/CompanyRepository', () => ({
  CompanyRepository: class {
    findAll = vi.fn();
  },
}));

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

const mockExecute = vi.fn();
vi.mock('@/2-application/use-cases/analytics/GetConsultantDashboardStatsUseCase', () => ({
  GetConsultantDashboardStatsUseCase: class {
    execute = mockExecute;
  },
}));

describe('GET /api/consultant-dashboard/stats', () => {
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
    return new NextRequest('http://localhost/api/consultant-dashboard/stats');
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

    it('should return 403 when user is not consultant or master_admin', async () => {
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
    it('should allow access for consultant', async () => {
      const consultantId = 'consultant-1';
      mockGetUser.mockResolvedValue({
        data: { user: { id: consultantId, email: 'consultant@example.com' } },
      });
      mockSingle.mockResolvedValue({
        data: { role: 'consultant' },
      });

      const mockStats = {
        totalCompanies: 5,
        totalProjects: 10,
        completedProjects: 5,
        activeProjects: 5,
        totalTrainings: 15,
        completedTrainings: 8,
        totalEvents: 3,
        upcomingEvents: 1,
        companyPerformance: [],
        projectProgress: [],
        trainingCompletion: [],
      };

      mockExecute.mockResolvedValue(Result.ok(mockStats));

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockStats);
      expect(mockExecute).toHaveBeenCalledWith(consultantId);
    });

    it('should allow access for master_admin', async () => {
      const adminId = 'admin-1';
      mockGetUser.mockResolvedValue({
        data: { user: { id: adminId, email: 'admin@example.com' } },
      });
      mockSingle.mockResolvedValue({
        data: { role: 'master_admin' },
      });

      const mockStats = {
        totalCompanies: 10,
        totalProjects: 20,
        completedProjects: 10,
        activeProjects: 10,
        totalTrainings: 30,
        completedTrainings: 15,
        totalEvents: 5,
        upcomingEvents: 2,
        companyPerformance: [],
        projectProgress: [],
        trainingCompletion: [],
      };

      mockExecute.mockResolvedValue(Result.ok(mockStats));

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockExecute).toHaveBeenCalledWith(adminId);
    });
  });

  describe('use case execution', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'consultant-1', email: 'consultant@example.com' } },
      });
      mockSingle.mockResolvedValue({
        data: { role: 'consultant' },
      });
    });

    it('should return consultant dashboard stats successfully', async () => {
      const mockStats = {
        totalCompanies: 5,
        totalProjects: 10,
        completedProjects: 5,
        activeProjects: 5,
        totalTrainings: 15,
        completedTrainings: 8,
        totalEvents: 3,
        upcomingEvents: 1,
        companyPerformance: [
          {
            companyName: 'Company 1',
            projects: 3,
            completedProjects: 2,
            completionRate: 66.67,
          },
        ],
        projectProgress: [{ projectName: 'Project 1', progress: 100, status: 'done' }],
        trainingCompletion: [
          { trainingName: 'Training 1', completed: 5, total: 10, completionRate: 50 },
        ],
      };

      mockExecute.mockResolvedValue(Result.ok(mockStats));

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.totalCompanies).toBe(5);
      expect(data.data.totalProjects).toBe(10);
      expect(data.data.completedProjects).toBe(5);
    });

    it('should return 400 when use case fails', async () => {
      mockExecute.mockResolvedValue(Result.fail('Failed to fetch consultant stats'));

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Failed to fetch consultant stats');
    });

    it('should return 500 when an error occurs', async () => {
      mockExecute.mockRejectedValue(new Error('Database connection error'));

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Consultant dashboard istatistikleri alınamadı');
    });
  });
});

