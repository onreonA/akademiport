import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { Result } from '@/6-core/result/Result';

// Mock authentication
vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock use case
const mockExecute = vi.fn();
vi.mock('@/2-application/use-cases/report', () => ({
  CreateReportTemplateUseCase: class {
    execute = mockExecute;
  },
}));

// Mock repository
vi.mock('@/4-infrastructure/database/repositories/SupabaseReportTemplateRepository', () => ({
  SupabaseReportTemplateRepository: class {},
}));

// Mock logger
vi.mock('@/5-shared/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe('POST /api/reports/templates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create template successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      role: 'master_admin',
    } as any);

    mockExecute.mockResolvedValue(Result.ok({ id: 'template-1' }));

    const request = new NextRequest('http://localhost/api/reports/templates', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Template',
        reportType: 'monthly',
        description: 'Test Description',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe('template-1');
  });

  it('should return 401 when not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/reports/templates', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Template',
        reportType: 'monthly',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 403 when user is not master_admin', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      role: 'consultant',
    } as any);

    const request = new NextRequest('http://localhost/api/reports/templates', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Template',
        reportType: 'monthly',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });

  it('should return 400 when name is missing', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      role: 'master_admin',
    } as any);

    const request = new NextRequest('http://localhost/api/reports/templates', {
      method: 'POST',
      body: JSON.stringify({
        reportType: 'monthly',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('name');
  });

  it('should return 400 when reportType is missing', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      role: 'master_admin',
    } as any);

    const request = new NextRequest('http://localhost/api/reports/templates', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Template',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('reportType');
  });

  it('should handle use case failure', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      role: 'master_admin',
    } as any);

    mockExecute.mockResolvedValue(
      Result.fail({
        message: 'Template creation failed',
        statusCode: 500,
      } as any)
    );

    const request = new NextRequest('http://localhost/api/reports/templates', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Template',
        reportType: 'monthly',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Failed to create template');
  });
});
