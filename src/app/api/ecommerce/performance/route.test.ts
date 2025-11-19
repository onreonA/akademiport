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
const mockCreateClient = vi.fn();

vi.mock('@/4-infrastructure/database/supabase-server', () => ({
  createClient: mockCreateClient,
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
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn(),
    });

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
      from: mockFrom,
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/ecommerce/performance');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim');
  });

  it('returns performance data successfully', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };

    // Create mock functions for users chain
    const mockSingleUsers = vi.fn().mockResolvedValue({
      data: {
        company_id: '123e4567-e89b-12d3-a456-426614174000',
        role: 'company_admin',
      },
      error: null,
    });

    const mockEqUsers = vi.fn().mockReturnValue({
      single: mockSingleUsers,
    });

    const mockSelectUsers = vi.fn().mockReturnValue({
      eq: mockEqUsers,
    });

    // Mock from() to handle 'users' calls
    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: mockSelectUsers,
        };
      }
      return {
        select: vi.fn(),
      };
    });

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: mockFrom,
    });

    const mockPerformance: EcommercePerformance[] = [
      {
        companyId: '123e4567-e89b-12d3-a456-426614174000',
        companyName: 'Test Company',
        programId: '123e4567-e89b-12d3-a456-426614174001',
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
      companyId: '123e4567-e89b-12d3-a456-426614174000',
      companyName: 'Test Company',
      programId: '123e4567-e89b-12d3-a456-426614174001',
      totalRevenueAllTime: 500000,
    });
  });

  it('applies filters correctly', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };

    // Create mock functions for users chain
    const mockSingleUsers = vi.fn().mockResolvedValue({
      data: {
        company_id: '123e4567-e89b-12d3-a456-426614174000',
        role: 'company_admin',
      },
      error: null,
    });

    const mockEqUsers = vi.fn().mockReturnValue({
      single: mockSingleUsers,
    });

    const mockSelectUsers = vi.fn().mockReturnValue({
      eq: mockEqUsers,
    });

    // Mock from() to handle 'users' calls
    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: mockSelectUsers,
        };
      }
      return {
        select: vi.fn(),
      };
    });

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: mockFrom,
    });

    mockGetPerformanceUseCaseExecute.mockResolvedValue(Result.ok([]));

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/ecommerce/performance?programId=123e4567-e89b-12d3-a456-426614174001&minRevenue=100000'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockGetPerformanceUseCaseExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        programId: '123e4567-e89b-12d3-a456-426614174001',
        minRevenue: 100000,
      })
    );
  });

  it('returns 400 when use case fails', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };

    // Create mock functions for users chain
    const mockSingleUsers = vi.fn().mockResolvedValue({
      data: {
        company_id: '123e4567-e89b-12d3-a456-426614174000',
        role: 'company_admin',
      },
      error: null,
    });

    const mockEqUsers = vi.fn().mockReturnValue({
      single: mockSingleUsers,
    });

    const mockSelectUsers = vi.fn().mockReturnValue({
      eq: mockEqUsers,
    });

    // Mock from() to handle 'users' calls
    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: mockSelectUsers,
        };
      }
      return {
        select: vi.fn(),
      };
    });

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: mockFrom,
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
