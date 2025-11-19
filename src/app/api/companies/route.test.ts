/**
 * Integration Tests for /api/companies
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';

vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  requireAuth: vi.fn(),
}));

// Mock use cases - use class mock pattern
const mockListCompaniesExecute = vi.fn();
const mockCreateCompanyExecute = vi.fn();

vi.mock('@/application/use-cases/company', () => ({
  ListCompaniesUseCase: class {
    execute = mockListCompaniesExecute;
  },
  CreateCompanyUseCase: class {
    execute = mockCreateCompanyExecute;
  },
}));

describe('GET /api/companies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(requireAuth).mockRejectedValue(new Error('Unauthorized'));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/companies');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns companies list successfully', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    mockListCompaniesExecute.mockResolvedValue({
      isFailure: false,
      value: {
        companies: [
          {
            id: 'company-1',
            name: 'Test Company',
            programId: 'program-1',
            isActive: true,
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      },
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/companies');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].id).toBe('company-1');
    expect(mockListCompaniesExecute).toHaveBeenCalled();
  });

  it('handles use case failure', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    mockListCompaniesExecute.mockResolvedValue({
      isFailure: true,
      error: 'Database error',
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/companies');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Database error');
  });
});

describe('POST /api/companies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 500 when user is not authenticated (caught by try-catch)', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(requireAuth).mockRejectedValue(new Error('Unauthorized'));

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/companies', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Company',
        programId: 'program-1',
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Unauthorized');
  });

  it('creates company successfully', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');
    const { NextRequest } = await import('next/server');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    const mockCompany = {
      id: 'company-1',
      name: 'Test Company',
      programId: '550e8400-e29b-41d4-a716-446655440000',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCreateCompanyExecute.mockResolvedValue({
      isFailure: false,
      value: mockCompany,
    });

    const requestBody = {
      name: 'Test Company',
      programId: '550e8400-e29b-41d4-a716-446655440000',
    };

    const { POST } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/companies', {
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
    expect(data.success).toBe(true);
    expect(data.data.id).toBe('company-1');
    expect(mockCreateCompanyExecute).toHaveBeenCalled();
  });

  it('returns 400 when validation fails', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');
    const { NextRequest } = await import('next/server');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    const { POST } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Missing required fields (name and programId)
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Geçersiz veri');
    expect(mockCreateCompanyExecute).not.toHaveBeenCalled();
  });

  it('handles use case failure', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');
    const { NextRequest } = await import('next/server');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    mockCreateCompanyExecute.mockResolvedValue({
      isFailure: true,
      error: 'Company creation failed',
    });

    const requestBody = {
      name: 'Test Company',
      programId: '550e8400-e29b-41d4-a716-446655440000',
    };

    const { POST } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/companies', {
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
    expect(data.error).toBe('Company creation failed');
  });
});
