/**
 * Integration Tests for /api/leaderboard/badges/[badgeId]
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest } from '@/5-shared/test/api-helpers';
import { Result } from '@/6-core/result/Result';
import { BadgeCategory, RequirementType } from '@/3-domain/enums/LeaderboardEnums';
import type { Badge } from '@/3-domain/entities/Leaderboard';

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

const mockUpdateBadgeUseCaseExecute = vi.fn();
const mockDeleteBadgeUseCaseExecute = vi.fn();

class MockUpdateBadgeUseCase {
  execute = mockUpdateBadgeUseCaseExecute;
}

class MockDeleteBadgeUseCase {
  execute = mockDeleteBadgeUseCaseExecute;
}

vi.mock('@/2-application/use-cases/leaderboard', () => ({
  UpdateBadgeUseCase: MockUpdateBadgeUseCase,
  DeleteBadgeUseCase: MockDeleteBadgeUseCase,
}));

describe('PATCH /api/leaderboard/badges/[badgeId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    } as any);

    const { PATCH } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/leaderboard/badges/badge-1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated Badge' }),
    });
    const response = await PATCH(request, {
      params: Promise.resolve({ badgeId: 'badge-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim');
  });

  it('returns 403 when user is not master_admin', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: 'company_user' },
      error: null,
    });

    const { PATCH } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/leaderboard/badges/badge-1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated Badge' }),
    });
    const response = await PATCH(request, {
      params: Promise.resolve({ badgeId: 'badge-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Yetkiniz yok');
  });

  it('updates badge successfully when user is master_admin', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: 'master_admin' },
      error: null,
    });

    const updatedBadge: Badge = {
      id: 'badge-1',
      name: 'Updated Badge',
      description: 'Updated description',
      icon: '🏆',
      category: BadgeCategory.PROJECT,
      requirementType: RequirementType.COUNT,
      requirementValue: 5,
      requirementActivity: 'task_completed',
      pointsBonus: 20,
      isActive: true,
      orderIndex: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUpdateBadgeUseCaseExecute.mockResolvedValue(Result.ok(updatedBadge));

    const { PATCH } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/leaderboard/badges/badge-1', {
      method: 'PATCH',
      body: JSON.stringify({
        name: 'Updated Badge',
        description: 'Updated description',
      }),
    });
    const response = await PATCH(request, {
      params: Promise.resolve({ badgeId: 'badge-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.badge).toMatchObject({
      id: 'badge-1',
      name: 'Updated Badge',
      category: BadgeCategory.PROJECT,
    });
  });

  it('returns 400 when validation fails', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: 'master_admin' },
      error: null,
    });

    const { PATCH } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/leaderboard/badges/badge-1', {
      method: 'PATCH',
      body: JSON.stringify({
        // Invalid data
        requirementValue: -1,
      }),
    });
    const response = await PATCH(request, {
      params: Promise.resolve({ badgeId: 'badge-1' }),
    });

    expect(response.status).toBe(400);
  });
});

describe('DELETE /api/leaderboard/badges/[badgeId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    } as any);

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/leaderboard/badges/badge-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ badgeId: 'badge-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim');
  });

  it('returns 403 when user is not master_admin', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: 'company_user' },
      error: null,
    });

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/leaderboard/badges/badge-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ badgeId: 'badge-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Yetkiniz yok');
  });

  it('deletes badge successfully when user is master_admin', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: 'master_admin' },
      error: null,
    });

    mockDeleteBadgeUseCaseExecute.mockResolvedValue(Result.ok(undefined));

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/leaderboard/badges/badge-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ badgeId: 'badge-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Rozet silindi');
    expect(mockDeleteBadgeUseCaseExecute).toHaveBeenCalledWith('badge-1');
  });

  it('returns 400 when use case fails', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: 'master_admin' },
      error: null,
    });

    mockDeleteBadgeUseCaseExecute.mockResolvedValue(Result.fail('Badge not found'));

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/leaderboard/badges/badge-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ badgeId: 'badge-1' }),
    });

    expect(response.status).toBe(400);
  });
});



