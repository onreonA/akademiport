/**
 * Integration Tests for /api/leaderboard/badges/company/[companyId]
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest } from '@/5-shared/test/api-helpers';
import { Result } from '@/6-core/result/Result';
import { BadgeCategory, RequirementType } from '@/3-domain/enums/LeaderboardEnums';
import type { CompanyBadge, Badge } from '@/3-domain/entities/Leaderboard';

const mockGetUser = vi.fn();

vi.mock('@/4-infrastructure/database/supabase-server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

const mockGetCompanyBadgesUseCaseExecute = vi.fn();

class MockGetCompanyBadgesUseCase {
  execute = mockGetCompanyBadgesUseCaseExecute;
}

vi.mock('@/2-application/use-cases/leaderboard', () => ({
  GetCompanyBadgesUseCase: MockGetCompanyBadgesUseCase,
}));

describe('GET /api/leaderboard/badges/company/[companyId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    } as any);

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/leaderboard/badges/company/company-1'
    );
    const response = await GET(request, {
      params: Promise.resolve({ companyId: 'company-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim');
  });

  it('returns company badges successfully', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    const mockBadge: Badge = {
      id: 'badge-1',
      name: 'İlk Adım',
      description: 'İlk görevini tamamladın!',
      icon: '🎯',
      category: BadgeCategory.PROJECT,
      requirementType: RequirementType.COUNT,
      requirementValue: 1,
      requirementActivity: 'task_completed',
      pointsBonus: 10,
      isActive: true,
      orderIndex: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockCompanyBadges: CompanyBadge[] = [
      {
        id: 'company-badge-1',
        companyId: 'company-1',
        badgeId: 'badge-1',
        earnedAt: new Date(),
      },
    ];

    mockGetCompanyBadgesUseCaseExecute.mockResolvedValue(Result.ok(mockCompanyBadges));

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/leaderboard/badges/company/company-1'
    );
    const response = await GET(request, {
      params: Promise.resolve({ companyId: 'company-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.badges).toHaveLength(1);
    expect(data.badges[0]).toMatchObject({
      companyId: 'company-1',
      badgeId: 'badge-1',
    });
    expect(mockGetCompanyBadgesUseCaseExecute).toHaveBeenCalledWith('company-1');
  });

  it('returns empty array when company has no badges', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockGetCompanyBadgesUseCaseExecute.mockResolvedValue(Result.ok([]));

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/leaderboard/badges/company/company-1'
    );
    const response = await GET(request, {
      params: Promise.resolve({ companyId: 'company-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.badges).toEqual([]);
  });

  it('returns 400 when use case fails', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockGetCompanyBadgesUseCaseExecute.mockResolvedValue(Result.fail('Failed to get badges'));

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/leaderboard/badges/company/company-1'
    );
    const response = await GET(request, {
      params: Promise.resolve({ companyId: 'company-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});
