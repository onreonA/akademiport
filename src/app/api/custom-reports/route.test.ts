/**
 * Integration Tests for /api/custom-reports
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';

vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock repository
const mockCustomReportRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

vi.mock('@/4-infrastructure/database/repositories/SupabaseCustomReportRepository', () => ({
  SupabaseCustomReportRepository: class {
    constructor() {
      return mockCustomReportRepository;
    }
  },
}));

// Mock use cases - route creates new instances
const mockListCustomReportsExecute = vi.fn();
const mockCreateCustomReportExecute = vi.fn();

vi.mock('@/2-application/use-cases/custom-report', () => ({
  ListCustomReportsUseCase: class {
    constructor() {}
    execute = mockListCustomReportsExecute;
  },
  CreateCustomReportUseCase: class {
    constructor() {}
    execute = mockCreateCustomReportExecute;
  },
}));

describe('GET /api/custom-reports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/custom-reports');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns custom reports list successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockListCustomReportsExecute.mockResolvedValue({
      isFailure: false,
      value: {
        reports: [
          {
            id: 'report-1',
            name: 'Test Report',
            reportType: 'performance',
            status: 'completed',
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/custom-reports');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.reports).toHaveLength(1);
    expect(data.reports[0].id).toBe('report-1');
    expect(mockListCustomReportsExecute).toHaveBeenCalled();
  });

  it('handles use case failure', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockListCustomReportsExecute.mockResolvedValue({
      isFailure: true,
      error: { message: 'Database error' },
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/custom-reports');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });
});

describe('POST /api/custom-reports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { POST } = await import('./route');
    const { NextRequest } = await import('next/server');
    const request = new NextRequest('http://localhost:3000/api/custom-reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'New Report',
        reportType: 'performance',
        selectedMetrics: [],
        dateRangeType: 'month',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('creates custom report successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    const { NextRequest } = await import('next/server');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockReport = {
      id: 'report-1',
      name: 'New Report',
      reportType: 'performance',
      status: 'pending',
      createdAt: new Date(),
    };

    mockCreateCustomReportExecute.mockResolvedValue({
      isFailure: false,
      value: mockReport,
    });

    const requestBody = {
      name: 'New Report',
      reportType: 'performance',
      selectedMetrics: ['metric1', 'metric2'],
      dateRangeType: 'month',
    };

    const { POST } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/custom-reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Mock json() method using Object.defineProperty
    Object.defineProperty(request, 'json', {
      value: vi.fn().mockResolvedValue(requestBody),
      writable: true,
      configurable: true,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBe('report-1');
    expect(mockCreateCustomReportExecute).toHaveBeenCalled();
  });

  it('returns 400 when validation fails - missing name', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    const { NextRequest } = await import('next/server');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const requestBody = {
      // Missing name
      reportType: 'performance',
      selectedMetrics: [],
      dateRangeType: 'month',
    };

    const { POST } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/custom-reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Mock json() method using Object.defineProperty
    Object.defineProperty(request, 'json', {
      value: vi.fn().mockResolvedValue(requestBody),
      writable: true,
      configurable: true,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('name is required');
  });

  it('handles use case failure', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    const { NextRequest } = await import('next/server');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockCreateCustomReportExecute.mockResolvedValue({
      isFailure: true,
      error: { message: 'Report creation failed' },
    });

    const requestBody = {
      name: 'New Report',
      reportType: 'performance',
      selectedMetrics: ['metric1'],
      dateRangeType: 'month',
    };

    const { POST } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/custom-reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Mock json() method using Object.defineProperty
    Object.defineProperty(request, 'json', {
      value: vi.fn().mockResolvedValue(requestBody),
      writable: true,
      configurable: true,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });
});
