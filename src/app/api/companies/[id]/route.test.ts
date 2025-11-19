/**
 * Integration Tests for /api/companies/[id]
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';

vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  requireAuth: vi.fn(),
}));

// Mock use cases - use class mock pattern
const mockGetCompanyExecute = vi.fn();
const mockUpdateCompanyExecute = vi.fn();
const mockDeleteCompanyExecute = vi.fn();

vi.mock('@/application/use-cases/company', () => ({
  GetCompanyUseCase: class {
    execute = mockGetCompanyExecute;
  },
  UpdateCompanyUseCase: class {
    execute = mockUpdateCompanyExecute;
  },
  DeleteCompanyUseCase: class {
    execute = mockDeleteCompanyExecute;
  },
}));

describe('GET /api/companies/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 500 when user is not authenticated (caught by try-catch)', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(requireAuth).mockRejectedValue(new Error('Unauthorized'));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/companies/company-1');
    const response = await GET(request, { params: Promise.resolve({ id: 'company-1' }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });

  it('returns company successfully', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    const mockCompany = {
      id: 'company-1',
      name: 'Test Company',
      programId: '550e8400-e29b-41d4-a716-446655440000',
      isActive: true,
    };

    mockGetCompanyExecute.mockResolvedValue({
      isFailure: false,
      value: mockCompany,
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/companies/company-1');
    const response = await GET(request, { params: Promise.resolve({ id: 'company-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe('company-1');
    expect(mockGetCompanyExecute).toHaveBeenCalled();
  });

  it('handles use case failure', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    mockGetCompanyExecute.mockResolvedValue({
      isFailure: true,
      error: 'Company not found',
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/companies/non-existent');
    const response = await GET(request, { params: Promise.resolve({ id: 'non-existent' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Company not found');
  });
});

describe('PATCH /api/companies/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates company successfully', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');
    const { NextRequest } = await import('next/server');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    const mockUpdatedCompany = {
      id: 'company-1',
      name: 'Updated Company',
      programId: '550e8400-e29b-41d4-a716-446655440000',
      isActive: true,
      updatedAt: new Date(),
    };

    mockUpdateCompanyExecute.mockResolvedValue({
      isFailure: false,
      value: mockUpdatedCompany,
    });

    const requestBody = {
      name: 'Updated Company',
    };

    const { PATCH } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/companies/company-1', {
      method: 'PATCH',
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

    const response = await PATCH(request, { params: Promise.resolve({ id: 'company-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('Updated Company');
    expect(mockUpdateCompanyExecute).toHaveBeenCalled();
  });

  it('handles use case failure', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');
    const { NextRequest } = await import('next/server');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    mockUpdateCompanyExecute.mockResolvedValue({
      isFailure: true,
      error: 'Update failed',
    });

    const requestBody = {
      name: 'Updated Company',
    };

    const { PATCH } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/companies/company-1', {
      method: 'PATCH',
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

    const response = await PATCH(request, { params: Promise.resolve({ id: 'company-1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Update failed');
  });
});

describe('DELETE /api/companies/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes company successfully', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    mockDeleteCompanyExecute.mockResolvedValue({
      isFailure: false,
      value: undefined,
    });

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/companies/company-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'company-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('silindi');
    expect(mockDeleteCompanyExecute).toHaveBeenCalled();
  });

  it('handles use case failure', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    mockDeleteCompanyExecute.mockResolvedValue({
      isFailure: true,
      error: 'Delete failed',
    });

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/companies/company-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'company-1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Delete failed');
  });
});
