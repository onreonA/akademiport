/**
 * Integration Tests for /api/programs
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';

vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  requireAuth: vi.fn(),
}));

// Mock use cases - use class mock pattern
const mockListProgramsExecute = vi.fn();
const mockCreateProgramExecute = vi.fn();

vi.mock('@/application/use-cases/program', () => ({
  ListProgramsUseCase: class {
    execute = mockListProgramsExecute;
  },
  CreateProgramUseCase: class {
    execute = mockCreateProgramExecute;
  },
}));

describe('GET /api/programs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 500 when user is not authenticated (caught by try-catch)', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(requireAuth).mockRejectedValue(new Error('Unauthorized'));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/programs');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });

  it('returns programs list successfully', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    mockListProgramsExecute.mockResolvedValue({
      isFailure: false,
      value: {
        programs: [
          {
            id: 'program-1',
            name: 'Test Program',
            status: 'active',
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/programs');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].id).toBe('program-1');
    expect(data.pagination.total).toBe(1);
    expect(mockListProgramsExecute).toHaveBeenCalled();
  });

  it('handles use case failure', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    mockListProgramsExecute.mockResolvedValue({
      isFailure: true,
      error: 'Database error',
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/programs');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Database error');
  });
});

describe('POST /api/programs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 500 when user is not authenticated (caught by try-catch)', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(requireAuth).mockRejectedValue(new Error('Unauthorized'));

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/programs', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Program',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });

  it('creates program successfully', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');
    const { NextRequest } = await import('next/server');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    const mockProgram = {
      id: 'program-1',
      name: 'Test Program',
      status: 'active',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCreateProgramExecute.mockResolvedValue({
      isFailure: false,
      value: mockProgram,
    });

    const requestBody = {
      name: 'Test Program',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
    };

    const { POST } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/programs', {
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
    expect(data.data.id).toBe('program-1');
    expect(mockCreateProgramExecute).toHaveBeenCalled();
  });

  it('handles use case failure', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');
    const { NextRequest } = await import('next/server');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    mockCreateProgramExecute.mockResolvedValue({
      isFailure: true,
      error: 'Program creation failed',
    });

    const requestBody = {
      name: 'Test Program',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
    };

    const { POST } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/programs', {
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
    expect(data.success).toBe(false);
    expect(data.error).toBe('Program creation failed');
  });
});
