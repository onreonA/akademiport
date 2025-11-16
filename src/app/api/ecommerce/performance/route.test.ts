/**
 * Integration Tests for /api/ecommerce/performance
 *
 * Tests e-commerce performance API route
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest } from '@/5-shared/test/api-helpers';
import { Result } from '@/6-core/result/Result';
import type { EcommercePerformance } from '@/3-domain/entities/Ecommerce';

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
const mockGetPerformanceUseCaseExecute = vi.fn();

class MockGetEcommercePerformanceUseCase {
  execute = mockGetPerformanceUseCaseExecute;
}

vi.mock('@/2-application/use-cases/ecommerce', () => ({
  GetEcommercePerformanceUseCase: MockGetEcommercePerformanceUseCase,
}));

describe('GET /api/ecommerce/performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    } as any);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/ecommerce/performance');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim');
  });

  it('returns performance data successfully', async () => {
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
        company_id: 'company-1',
        role: 'company_admin',
      },
      error: null,
    });

    const mockPerformance: EcommercePerformance[] = [
      {
        companyId: 'company-1',
        companyName: 'Test Company',
        programId: 'program-1',
        programName: 'Test Program',
        totalVisitorsAllTime: 10000,
        totalProductsAllTime: 500,
        totalOrdersAllTime: 100,
        totalRevenueAllTime: 500000,
        visitorsLast3Months: 3000,
        ordersLast3Months: 30,
        revenueLast3Months: 150000,
        visitorsLastMonth: 1000,
        ordersLastMonth: 10,
        revenueLastMonth: 50000,
        alibabaRevenueTotal: 300000,
        b2cRevenueTotal: 200000,
        avgMonthlyRevenue: 50000,
        revenueGrowthPercentage: 10.5,
        lastUpdatedAt: new Date(),
        lastPeriod: '2025-11',
      },
    ];

    mockGetPerformanceUseCaseExecute.mockResolvedValue(Result.ok(mockPerformance));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/ecommerce/performance');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.performance).toHaveLength(1);
    expect(data.performance[0]).toMatchObject({
      companyId: 'company-1',
      companyName: 'Test Company',
      programId: 'program-1',
      totalRevenueAllTime: 500000,
    });
  });

  it('applies filters correctly', async () => {
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
        company_id: 'company-1',
        role: 'company_admin',
      },
      error: null,
    });

    mockGetPerformanceUseCaseExecute.mockResolvedValue(Result.ok([]));

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/ecommerce/performance?programId=program-1&minRevenue=100000'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockGetPerformanceUseCaseExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        programId: 'program-1',
        minRevenue: 100000,
      })
    );
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
        company_id: 'company-1',
        role: 'company_admin',
      },
      error: null,
    });

    mockGetPerformanceUseCaseExecute.mockResolvedValue(
      Result.fail(new Error('Failed to get performance'))
    );

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/ecommerce/performance');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});
