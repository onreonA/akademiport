/**
 * Integration Tests for /api/ecommerce/metrics
 *
 * Tests e-commerce metrics API routes with authentication and validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest } from '@/5-shared/test/api-helpers';
import { Result } from '@/6-core/result/Result';
import { EcommercePlatformType } from '@/3-domain/enums/EcommerceEnums';
import type { EcommerceMetrics } from '@/3-domain/entities/Ecommerce';

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

// Mock repository
const mockCreateMetrics = vi.fn();
const mockListMetrics = vi.fn();
const mockCountMetrics = vi.fn();

class MockSupabaseEcommerceRepository {
  createMetrics = mockCreateMetrics;
  updateMetrics = vi.fn();
  findMetricsById = vi.fn();
  findMetricsByCompanyAndPeriod = vi.fn();
  listMetrics = mockListMetrics;
  countMetrics = mockCountMetrics;
  deleteMetrics = vi.fn();
  refreshPerformance = vi.fn();
  getPerformance = vi.fn();
  getCompanyPerformance = vi.fn();
  getMinistryDashboard = vi.fn();
}

vi.mock('@/4-infrastructure/database/repositories/SupabaseEcommerceRepository', () => ({
  SupabaseEcommerceRepository: MockSupabaseEcommerceRepository,
}));

// Mock use cases
const mockCreateUseCaseExecute = vi.fn();
const mockGetUseCaseExecute = vi.fn();

class MockCreateEcommerceMetricsUseCase {
  execute = mockCreateUseCaseExecute;
}

class MockGetEcommerceMetricsUseCase {
  execute = mockGetUseCaseExecute;
}

vi.mock('@/2-application/use-cases/ecommerce', () => ({
  CreateEcommerceMetricsUseCase: MockCreateEcommerceMetricsUseCase,
  GetEcommerceMetricsUseCase: MockGetEcommerceMetricsUseCase,
}));

describe('POST /api/ecommerce/metrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    } as any);

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/ecommerce/metrics', {
      method: 'POST',
      body: {},
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim');
  });

  it('creates metrics successfully', async () => {
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

    const mockMetrics: EcommerceMetrics = {
      id: 'metric-1',
      companyId: 'company-1',
      programId: 'program-1',
      periodYear: 2025,
      periodMonth: 11,
      platformType: EcommercePlatformType.ALIBABA,
      alibabaVisitors: 1000,
      alibabaProducts: 50,
      alibabaRfqCount: 10,
      alibabaOrders: 5,
      alibabaRevenue: 50000,
      b2cVisitors: 0,
      b2cProducts: 0,
      b2cOrders: 0,
      b2cRevenue: 0,
      totalVisitors: 1000,
      totalProducts: 50,
      totalOrders: 5,
      totalRevenue: 50000,
      notes: null,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user-1',
    };

    mockCreateUseCaseExecute.mockResolvedValue(Result.ok({ id: 'metric-1' }));

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/ecommerce/metrics', {
      method: 'POST',
      body: {
        companyId: 'company-1',
        programId: 'program-1',
        periodYear: 2025,
        periodMonth: 11,
        platformType: EcommercePlatformType.ALIBABA,
        alibabaVisitors: 1000,
        alibabaProducts: 50,
        alibabaRfqCount: 10,
        alibabaOrders: 5,
        alibabaRevenue: 50000,
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBe('metric-1');
  });

  it('returns 400 when validation fails', async () => {
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

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/ecommerce/metrics', {
      method: 'POST',
      body: {
        companyId: 'invalid-uuid',
        periodYear: 2019, // Invalid year
        periodMonth: 13, // Invalid month
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
    expect(data.details).toBeDefined();
  });
});

describe('GET /api/ecommerce/metrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    } as any);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/ecommerce/metrics');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim');
  });

  it('returns metrics list successfully', async () => {
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

    const mockMetrics: EcommerceMetrics[] = [
      {
        id: 'metric-1',
        companyId: 'company-1',
        programId: 'program-1',
        periodYear: 2025,
        periodMonth: 11,
        platformType: EcommercePlatformType.ALIBABA,
        alibabaVisitors: 1000,
        alibabaProducts: 50,
        alibabaRfqCount: 10,
        alibabaOrders: 5,
        alibabaRevenue: 50000,
        b2cVisitors: 0,
        b2cProducts: 0,
        b2cOrders: 0,
        b2cRevenue: 0,
        totalVisitors: 1000,
        totalProducts: 50,
        totalOrders: 5,
        totalRevenue: 50000,
        notes: null,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-1',
      },
    ];

    mockGetUseCaseExecute.mockResolvedValue(
      Result.ok({
        metrics: mockMetrics,
        total: 1,
      })
    );

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/ecommerce/metrics');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.metrics).toHaveLength(1);
    expect(data.total).toBe(1);
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

    mockGetUseCaseExecute.mockResolvedValue(
      Result.ok({
        metrics: [],
        total: 0,
      })
    );

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/ecommerce/metrics?companyId=company-1&programId=program-1&periodYear=2025&periodMonth=11'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockGetUseCaseExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: 'company-1',
        programId: 'program-1',
        periodYear: 2025,
        periodMonth: 11,
      })
    );
  });
});
