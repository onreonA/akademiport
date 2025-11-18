import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';
import { GetAIInsightsUseCase } from '@/2-application/use-cases/analytics';
import { Result } from '@/6-core/result/Result';

// Mock dependencies
vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const mockExecute = vi.fn();
vi.mock('@/2-application/use-cases/analytics', () => ({
  GetAIInsightsUseCase: class {
    execute = mockExecute;
  },
}));

vi.mock('@/4-infrastructure/database/repositories/UserRepository', () => ({
  UserRepository: class {},
}));

vi.mock('@/4-infrastructure/database/repositories/CompanyRepository', () => ({
  CompanyRepository: class {},
}));

vi.mock('@/4-infrastructure/database/repositories/ProjectRepository', () => ({
  ProjectRepository: class {},
}));

vi.mock('@/4-infrastructure/database/repositories/TaskRepository', () => ({
  TaskRepository: class {},
}));

vi.mock('@/4-infrastructure/database/repositories/TrainingRepository', () => ({
  TrainingRepository: class {},
}));

vi.mock('@/4-infrastructure/database/repositories/EventRepository', () => ({
  EventRepository: class {},
}));

vi.mock('@/5-shared/services/ai/ai-router.service', () => ({
  AIRouterService: class {},
}));

vi.mock('@/5-shared/services/ai/prompt-manager.service', () => ({
  PromptManagerService: class {},
}));

vi.mock('@/5-shared/services/ai/token-tracker.service', () => ({
  TokenTrackerService: class {},
}));

vi.mock('@/5-shared/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';

describe('GET /api/dashboard/ai-insights', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockRequest = (searchParams: Record<string, string> = {}) => {
    const url = new URL('http://localhost/api/dashboard/ai-insights');
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return new NextRequest(url);
  };

  describe('authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('successful requests', () => {
    beforeEach(() => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        role: 'master_admin',
      } as any);
    });

    it('should get AI insights successfully for master dashboard', async () => {
      const mockInsights = {
        insights: [
          {
            type: 'trend',
            title: 'User Growth',
            description: 'Users are growing',
            severity: 'low',
            category: 'users',
          },
        ],
        trends: [
          {
            metric: 'users',
            direction: 'up',
            change: 10,
            period: 'month',
          },
        ],
        anomalies: [],
        recommendations: [],
      };

      mockExecute.mockResolvedValue(Result.ok(mockInsights));

      const request = createMockRequest({ dashboardType: 'master' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockInsights);
      expect(mockExecute).toHaveBeenCalledWith({
        userId: 'user-1',
        dashboardType: 'master',
        companyId: undefined,
        programId: undefined,
      });
    });

    it('should get AI insights successfully for consultant dashboard with programId', async () => {
      const mockInsights = {
        insights: [],
        trends: [],
        anomalies: [],
        recommendations: [],
      };

      mockExecute.mockResolvedValue(Result.ok(mockInsights));

      const request = createMockRequest({
        dashboardType: 'consultant',
        programId: 'program-1',
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockInsights);
      expect(mockExecute).toHaveBeenCalledWith({
        userId: 'user-1',
        dashboardType: 'consultant',
        companyId: undefined,
        programId: 'program-1',
      });
    });

    it('should get AI insights successfully for company dashboard with companyId', async () => {
      const mockInsights = {
        insights: [],
        trends: [],
        anomalies: [],
        recommendations: [],
      };

      mockExecute.mockResolvedValue(Result.ok(mockInsights));

      const request = createMockRequest({
        dashboardType: 'company',
        companyId: 'company-1',
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockInsights);
      expect(mockExecute).toHaveBeenCalledWith({
        userId: 'user-1',
        dashboardType: 'company',
        companyId: 'company-1',
        programId: undefined,
      });
    });

    it('should default to master dashboard when dashboardType is not provided', async () => {
      const mockInsights = {
        insights: [],
        trends: [],
        anomalies: [],
        recommendations: [],
      };

      mockExecute.mockResolvedValue(Result.ok(mockInsights));

      const request = createMockRequest();
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockExecute).toHaveBeenCalledWith({
        userId: 'user-1',
        dashboardType: 'master',
        companyId: undefined,
        programId: undefined,
      });
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        role: 'master_admin',
      } as any);
    });

    it('should return 500 when use case fails', async () => {
      mockExecute.mockResolvedValue(Result.fail('Use case error'));

      const request = createMockRequest({ dashboardType: 'master' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Use case error');
    });

    it('should return 500 when exception occurs', async () => {
      mockExecute.mockRejectedValue(new Error('Unexpected error'));

      const request = createMockRequest({ dashboardType: 'master' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});
