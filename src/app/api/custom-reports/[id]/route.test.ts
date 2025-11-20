/**
 * Integration Tests for /api/custom-reports/[id]
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
const mockGetCustomReportExecute = vi.fn();
const mockUpdateCustomReportExecute = vi.fn();
const mockDeleteCustomReportExecute = vi.fn();

vi.mock('@/2-application/use-cases/custom-report', () => ({
  GetCustomReportUseCase: class {
    constructor() {}
    execute = mockGetCustomReportExecute;
  },
  UpdateCustomReportUseCase: class {
    constructor() {}
    execute = mockUpdateCustomReportExecute;
  },
  DeleteCustomReportUseCase: class {
    constructor() {}
    execute = mockDeleteCustomReportExecute;
  },
}));

describe('GET /api/custom-reports/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/custom-reports/report-1');
    const response = await GET(request, { params: Promise.resolve({ id: 'report-1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns custom report successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockReport = {
      id: 'report-1',
      name: 'Test Report',
      reportType: 'performance',
      status: 'completed',
    };

    mockGetCustomReportExecute.mockResolvedValue({
      isFailure: false,
      value: mockReport,
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/custom-reports/report-1');
    const response = await GET(request, { params: Promise.resolve({ id: 'report-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe('report-1');
    expect(mockGetCustomReportExecute).toHaveBeenCalled();
  });

  it('handles use case failure - not found', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockGetCustomReportExecute.mockResolvedValue({
      isFailure: true,
      error: { message: 'Custom report bulunamadı', statusCode: 404 },
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/custom-reports/non-existent');
    const response = await GET(request, { params: Promise.resolve({ id: 'non-existent' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain('bulunamadı');
  });
});

describe('PUT /api/custom-reports/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { PUT } = await import('./route');
    const { NextRequest } = await import('next/server');
    const request = new NextRequest('http://localhost:3000/api/custom-reports/report-1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Updated Report',
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'report-1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('updates custom report successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    const { NextRequest } = await import('next/server');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockUpdatedReport = {
      id: 'report-1',
      name: 'Updated Report',
      reportType: 'performance',
      status: 'completed',
      updatedAt: new Date(),
    };

    mockUpdateCustomReportExecute.mockResolvedValue({
      isFailure: false,
      value: mockUpdatedReport,
    });

    const requestBody = {
      name: 'Updated Report',
    };

    const { PUT } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/custom-reports/report-1', {
      method: 'PUT',
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

    const response = await PUT(request, { params: Promise.resolve({ id: 'report-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe('report-1');
    expect(data.name).toBe('Updated Report');
    expect(mockUpdateCustomReportExecute).toHaveBeenCalled();
  });

  it('handles use case failure', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    const { NextRequest } = await import('next/server');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockUpdateCustomReportExecute.mockResolvedValue({
      isFailure: true,
      error: { message: 'Update failed', statusCode: 500 },
    });

    const requestBody = {
      name: 'Updated Report',
    };

    const { PUT } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/custom-reports/report-1', {
      method: 'PUT',
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

    const response = await PUT(request, { params: Promise.resolve({ id: 'report-1' }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Update failed');
  });
});

describe('DELETE /api/custom-reports/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/custom-reports/report-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'report-1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('deletes custom report successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockDeleteCustomReportExecute.mockResolvedValue({
      isFailure: false,
      value: undefined,
    });

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/custom-reports/report-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'report-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDeleteCustomReportExecute).toHaveBeenCalled();
  });

  it('handles use case failure', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockDeleteCustomReportExecute.mockResolvedValue({
      isFailure: true,
      error: { message: 'Delete failed', statusCode: 500 },
    });

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/custom-reports/report-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'report-1' }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Delete failed');
  });
});
