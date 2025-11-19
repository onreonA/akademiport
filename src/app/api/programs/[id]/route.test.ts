/**
 * Integration Tests for /api/programs/[id]
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';

vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  requireAuth: vi.fn(),
}));

// Mock use cases - use class mock pattern
const mockGetProgramExecute = vi.fn();
const mockUpdateProgramExecute = vi.fn();
const mockDeleteProgramExecute = vi.fn();

vi.mock('@/application/use-cases/program', () => ({
  GetProgramUseCase: class {
    execute = mockGetProgramExecute;
  },
  UpdateProgramUseCase: class {
    execute = mockUpdateProgramExecute;
  },
  DeleteProgramUseCase: class {
    execute = mockDeleteProgramExecute;
  },
}));

describe('GET /api/programs/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns program successfully', async () => {
    const mockProgram = {
      id: 'program-1',
      name: 'Test Program',
      status: 'active',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
    };

    mockGetProgramExecute.mockResolvedValue({
      isFailure: false,
      value: mockProgram,
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/programs/program-1');
    const response = await GET(request, { params: Promise.resolve({ id: 'program-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe('program-1');
    expect(mockGetProgramExecute).toHaveBeenCalled();
  });

  it('handles use case failure - not found', async () => {
    mockGetProgramExecute.mockResolvedValue({
      isFailure: true,
      error: { message: 'Program bulunamadı' },
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/programs/non-existent');
    const response = await GET(request, { params: Promise.resolve({ id: 'non-existent' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toContain('bulunamadı');
  });

  it('handles use case failure - other error', async () => {
    mockGetProgramExecute.mockResolvedValue({
      isFailure: true,
      error: { message: 'Database error' },
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/programs/program-1');
    const response = await GET(request, { params: Promise.resolve({ id: 'program-1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Database error');
  });
});

describe('PATCH /api/programs/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 500 when user is not authenticated (caught by try-catch)', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(requireAuth).mockRejectedValue(new Error('Unauthorized'));

    const { PATCH } = await import('./route');
    const { NextRequest } = await import('next/server');
    const request = new NextRequest('http://localhost:3000/api/programs/program-1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Updated Program',
      }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: 'program-1' }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });

  it('updates program successfully', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');
    const { NextRequest } = await import('next/server');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    const mockUpdatedProgram = {
      id: 'program-1',
      name: 'Updated Program',
      status: 'active',
      updatedAt: new Date(),
    };

    mockUpdateProgramExecute.mockResolvedValue({
      isFailure: false,
      value: mockUpdatedProgram,
    });

    const requestBody = {
      name: 'Updated Program',
    };

    const { PATCH } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/programs/program-1', {
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

    const response = await PATCH(request, { params: Promise.resolve({ id: 'program-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('Updated Program');
    expect(mockUpdateProgramExecute).toHaveBeenCalled();
  });

  it('handles use case failure', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');
    const { NextRequest } = await import('next/server');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    mockUpdateProgramExecute.mockResolvedValue({
      isFailure: true,
      error: 'Update failed',
    });

    const requestBody = {
      name: 'Updated Program',
    };

    const { PATCH } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/programs/program-1', {
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

    const response = await PATCH(request, { params: Promise.resolve({ id: 'program-1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Update failed');
  });
});

describe('DELETE /api/programs/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 500 when user is not authenticated (caught by try-catch)', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(requireAuth).mockRejectedValue(new Error('Unauthorized'));

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/programs/program-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'program-1' }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });

  it('deletes program successfully', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    mockDeleteProgramExecute.mockResolvedValue({
      isFailure: false,
      value: undefined,
    });

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/programs/program-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'program-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('silindi');
    expect(mockDeleteProgramExecute).toHaveBeenCalled();
  });

  it('handles use case failure', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    mockDeleteProgramExecute.mockResolvedValue({
      isFailure: true,
      error: 'Delete failed',
    });

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/programs/program-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'program-1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Delete failed');
  });
});
