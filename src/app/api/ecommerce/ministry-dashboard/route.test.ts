/**
 * Integration Tests for /api/ecommerce/ministry-dashboard
 *
 * Tests ministry dashboard API route
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest } from '@/5-shared/test/api-helpers';
import { Result } from '@/6-core/result/Result';

// Mock Supabase client
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

vi.mock('@/4-infrastructure/database/supabase-server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}));

// Mock use case
const mockGetMinistryDashboardUseCaseExecute = vi.fn();

class MockGetMinistryDashboardUseCase {
  execute = mockGetMinistryDashboardUseCaseExecute;
}

vi.mock('@/2-application/use-cases/ecommerce', () => ({
  GetMinistryDashboardUseCase: MockGetMinistryDashboardUseCase,
}));

describe('GET /api/ecommerce/ministry-dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    } as any);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/ecommerce/ministry-dashboard');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim');
  });

  it('returns 403 when user is not master admin', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockFrom.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });
    mockSingle.mockResolvedValue({
      data: {
        role: 'company_admin', // Not master_admin
      },
      error: null,
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/ecommerce/ministry-dashboard');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Bu işlem için yetkiniz yok');
  });

  it('returns dashboard data successfully for master admin', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockFrom.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });
    mockSingle.mockResolvedValue({
      data: {
        role: 'master_admin',
      },
      error: null,
    });

    const mockDashboard = {
      totalCompanies: 10,
      totalRevenue: 5000000,
      avgRevenue: 500000,
      totalOrders: 1000,
      totalVisitors: 50000,
      growthRate: 15.5,
      topCompanies: [],
      platformDistribution: [
        { platform: 'alibaba', revenue: 3000000, companies: 5 },
        { platform: 'amazon', revenue: 1500000, companies: 3 },
      ],
    };

    mockGetMinistryDashboardUseCaseExecute.mockResolvedValue(Result.ok(mockDashboard));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/ecommerce/ministry-dashboard');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.dashboard).toMatchObject({
      totalCompanies: 10,
      totalRevenue: 5000000,
      avgRevenue: 500000,
    });
  });

  it('applies programId filter correctly', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockFrom.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });
    mockSingle.mockResolvedValue({
      data: {
        role: 'master_admin',
      },
      error: null,
    });

    const mockDashboard = {
      totalCompanies: 5,
      totalRevenue: 2500000,
      avgRevenue: 500000,
      totalOrders: 500,
      totalVisitors: 25000,
      growthRate: 12.0,
      topCompanies: [],
      platformDistribution: [],
    };

    mockGetMinistryDashboardUseCaseExecute.mockResolvedValue(Result.ok(mockDashboard));

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/ecommerce/ministry-dashboard?programId=program-1'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockGetMinistryDashboardUseCaseExecute).toHaveBeenCalledWith('program-1');
  });

  it('returns 400 when use case fails', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockFrom.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });
    mockSingle.mockResolvedValue({
      data: {
        role: 'master_admin',
      },
      error: null,
    });

    mockGetMinistryDashboardUseCaseExecute.mockResolvedValue(
      Result.fail(new Error('Failed to get dashboard'))
    );

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/ecommerce/ministry-dashboard');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});
