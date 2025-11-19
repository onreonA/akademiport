/**
 * Integration Tests for /api/custom-reports/[id]/export
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';

vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock use cases
const mockGetCustomReportExecute = vi.fn();
const mockGetDashboardStatsExecute = vi.fn();
const mockGetConsultantDashboardStatsExecute = vi.fn();
const mockGetCompanyDashboardStatsExecute = vi.fn();

vi.mock('@/2-application/use-cases/custom-report', () => ({
  GetCustomReportUseCase: class {
    constructor() {}
    execute = mockGetCustomReportExecute;
  },
}));

vi.mock('@/2-application/use-cases/analytics/GetDashboardStatsUseCase', () => ({
  GetDashboardStatsUseCase: class {
    constructor() {}
    execute = mockGetDashboardStatsExecute;
  },
}));

vi.mock('@/2-application/use-cases/analytics/GetConsultantDashboardStatsUseCase', () => ({
  GetConsultantDashboardStatsUseCase: class {
    constructor() {}
    execute = mockGetConsultantDashboardStatsExecute;
  },
}));

vi.mock('@/2-application/use-cases/analytics/GetCompanyDashboardStatsUseCase', () => ({
  GetCompanyDashboardStatsUseCase: class {
    constructor() {}
    execute = mockGetCompanyDashboardStatsExecute;
  },
}));

// Mock export services
const mockPDFExport = vi.fn();
const mockExcelExport = vi.fn();
const mockCSVExport = vi.fn();

vi.mock('@/5-shared/services/export', () => ({
  PDFExportService: {
    exportDashboardStats: mockPDFExport,
  },
  ExcelExportService: {
    exportDashboardStats: mockExcelExport,
  },
  CSVExportService: {
    exportDashboardStats: mockCSVExport,
  },
}));

vi.mock('@/5-shared/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe('GET /api/custom-reports/[id]/export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment
    delete process.env.NEXT_PHASE;
    delete process.env.NODE_ENV;
    delete process.env.VERCEL;
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/custom-reports/report-1/export?format=pdf'
    );
    const response = await GET(request, { params: Promise.resolve({ id: 'report-1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 400 when format is invalid', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/custom-reports/report-1/export?format=invalid'
    );
    const response = await GET(request, { params: Promise.resolve({ id: 'report-1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid format');
  });

  it('exports dashboard report as PDF successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockReport = {
      id: 'report-1',
      name: 'Test Dashboard Report',
      reportType: 'dashboard',
      selectedMetrics: ['totalUsers', 'totalCompanies'],
      description: 'Test description',
    };

    const mockStats = {
      totalUsers: 100,
      totalCompanies: 50,
    };

    mockGetCustomReportExecute.mockResolvedValue({
      isFailure: false,
      value: mockReport,
    });

    mockGetDashboardStatsExecute.mockResolvedValue({
      isFailure: false,
      value: mockStats,
    });

    const mockPDFBlob = new Blob(['PDF content'], { type: 'application/pdf' });
    mockPDFExport.mockReturnValue(mockPDFBlob);

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/custom-reports/report-1/export?format=pdf'
    );
    const response = await GET(request, { params: Promise.resolve({ id: 'report-1' }) });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(response.headers.get('Content-Disposition')).toContain(
      'custom-report-Test-Dashboard-Report'
    );
    expect(mockGetCustomReportExecute).toHaveBeenCalledWith('report-1', user.id, true);
    expect(mockGetDashboardStatsExecute).toHaveBeenCalled();
    expect(mockPDFExport).toHaveBeenCalledWith({
      title: 'Test Dashboard Report',
      subtitle: 'Test description',
      data: { totalUsers: 100, totalCompanies: 50 },
    });
  });

  it('exports program report as Excel successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.CONSULTANT });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockReport = {
      id: 'report-2',
      name: 'Test Program Report',
      reportType: 'program',
      selectedMetrics: ['totalProjects'],
    };

    const mockStats = {
      totalProjects: 25,
    };

    mockGetCustomReportExecute.mockResolvedValue({
      isFailure: false,
      value: mockReport,
    });

    mockGetConsultantDashboardStatsExecute.mockResolvedValue({
      isFailure: false,
      value: mockStats,
    });

    const mockExcelBlob = new Blob(['Excel content'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    mockExcelExport.mockReturnValue(mockExcelBlob);

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/custom-reports/report-2/export?format=excel'
    );
    const response = await GET(request, { params: Promise.resolve({ id: 'report-2' }) });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    expect(response.headers.get('Content-Disposition')).toContain('.xlsx');
    expect(mockGetConsultantDashboardStatsExecute).toHaveBeenCalledWith(user.id);
    expect(mockExcelExport).toHaveBeenCalledWith({
      title: 'Test Program Report',
      data: { totalProjects: 25 },
    });
  });

  it('exports company report as CSV successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.COMPANY_ADMIN, companyId: 'company-1' });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockReport = {
      id: 'report-3',
      name: 'Test Company Report',
      reportType: 'company',
      selectedMetrics: ['totalEvents'],
      companyId: 'company-1',
    };

    const mockStats = {
      totalEvents: 10,
    };

    mockGetCustomReportExecute.mockResolvedValue({
      isFailure: false,
      value: mockReport,
    });

    mockGetCompanyDashboardStatsExecute.mockResolvedValue({
      isFailure: false,
      value: mockStats,
    });

    mockCSVExport.mockReturnValue('CSV content');

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/custom-reports/report-3/export?format=csv'
    );
    const response = await GET(request, { params: Promise.resolve({ id: 'report-3' }) });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/csv;charset=utf-8');
    expect(response.headers.get('Content-Disposition')).toContain('.csv');
    expect(mockGetCompanyDashboardStatsExecute).toHaveBeenCalledWith('company-1');
    expect(mockCSVExport).toHaveBeenCalledWith({
      title: 'Test Company Report',
      data: { totalEvents: 10 },
    });
  });

  it('returns 404 when report not found', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockGetCustomReportExecute.mockResolvedValue({
      isFailure: true,
      error: { message: 'Custom report bulunamadı', statusCode: 404 },
    });

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/custom-reports/non-existent/export?format=pdf'
    );
    const response = await GET(request, { params: Promise.resolve({ id: 'non-existent' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain('bulunamadı');
  });

  it('returns 500 when stats fetch fails', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockReport = {
      id: 'report-4',
      name: 'Test Report',
      reportType: 'dashboard',
      selectedMetrics: ['totalUsers'],
    };

    mockGetCustomReportExecute.mockResolvedValue({
      isFailure: false,
      value: mockReport,
    });

    mockGetDashboardStatsExecute.mockResolvedValue({
      isFailure: true,
      error: { message: 'Stats fetch failed' },
    });

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/custom-reports/report-4/export?format=pdf'
    );
    const response = await GET(request, { params: Promise.resolve({ id: 'report-4' }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Dashboard verileri alınamadı');
  });

  it('returns 400 when report type is invalid', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockReport = {
      id: 'report-5',
      name: 'Test Report',
      reportType: 'invalid-type',
      selectedMetrics: ['totalUsers'],
    };

    mockGetCustomReportExecute.mockResolvedValue({
      isFailure: false,
      value: mockReport,
    });

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/custom-reports/report-5/export?format=pdf'
    );
    const response = await GET(request, { params: Promise.resolve({ id: 'report-5' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid report type');
  });

  it('filters stats based on selected metrics', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockReport = {
      id: 'report-6',
      name: 'Test Report',
      reportType: 'dashboard',
      selectedMetrics: ['totalUsers'], // Only one metric selected
    };

    const mockStats = {
      totalUsers: 100,
      totalCompanies: 50,
      totalProjects: 200, // This should be filtered out
    };

    mockGetCustomReportExecute.mockResolvedValue({
      isFailure: false,
      value: mockReport,
    });

    mockGetDashboardStatsExecute.mockResolvedValue({
      isFailure: false,
      value: mockStats,
    });

    const mockPDFBlob = new Blob(['PDF content'], { type: 'application/pdf' });
    mockPDFExport.mockReturnValue(mockPDFBlob);

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/custom-reports/report-6/export?format=pdf'
    );
    const response = await GET(request, { params: Promise.resolve({ id: 'report-6' }) });

    expect(response.status).toBe(200);
    // Verify only selected metrics are passed to export service
    expect(mockPDFExport).toHaveBeenCalledWith({
      title: 'Test Report',
      subtitle: undefined,
      data: { totalUsers: 100 }, // Only selected metric
    });
  });
});
