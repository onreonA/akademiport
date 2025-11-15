/**
 * Integration Tests for /api/leaderboard/badges
 *
 * Tests badge API routes with authentication, authorization, and validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest } from '@/5-shared/test/api-helpers';
import { Result } from '@/6-core/result/Result';
import { BadgeCategory, RequirementType } from '@/3-domain/enums/LeaderboardEnums';
import type { Badge } from '@/3-domain/entities/Leaderboard';

// Mock Supabase client
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

// Mock repository
class MockSupabaseLeaderboardRepository {
  getRankings = vi.fn();
  addScore = vi.fn();
  refreshRankings = vi.fn();
  getCompanyRanking = vi.fn();
  getBadges = vi.fn();
  getBadgeById = vi.fn();
  createBadge = vi.fn();
  updateBadge = vi.fn();
  deleteBadge = vi.fn();
  getCompanyBadges = vi.fn();
  getCompanyScores = vi.fn();
  getHistory = vi.fn();
  createSnapshot = vi.fn();
  getCompanyTrend = vi.fn();
}

vi.mock('@/4-infrastructure/database/repositories/SupabaseLeaderboardRepository', () => ({
  SupabaseLeaderboardRepository: MockSupabaseLeaderboardRepository,
}));

// Mock use cases
const mockGetBadgesUseCaseExecute = vi.fn();
const mockCreateBadgeUseCaseExecute = vi.fn();

class MockGetBadgesUseCase {
  execute = mockGetBadgesUseCaseExecute;
}

class MockCreateBadgeUseCase {
  execute = mockCreateBadgeUseCaseExecute;
}

vi.mock('@/2-application/use-cases/leaderboard', () => ({
  GetBadgesUseCase: MockGetBadgesUseCase,
  CreateBadgeUseCase: MockCreateBadgeUseCase,
}));

describe('GET /api/leaderboard/badges', () => {
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

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/leaderboard/badges');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim');
  });

  it('returns badges successfully', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    const createdAt = new Date();
    const updatedAt = new Date();
    const mockBadges: Badge[] = [
      {
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
        createdAt,
        updatedAt,
      },
    ];

    mockGetBadgesUseCaseExecute.mockResolvedValue(Result.ok(mockBadges));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/leaderboard/badges');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.badges).toHaveLength(1);
    expect(data.badges[0]).toMatchObject({
      id: 'badge-1',
      name: 'İlk Adım',
      category: BadgeCategory.PROJECT,
      requirementType: RequirementType.COUNT,
      requirementValue: 1,
      isActive: true,
    });
  });

  it('returns badges with category filter', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    const mockBadges: Badge[] = [];
    mockGetBadgesUseCaseExecute.mockResolvedValue(Result.ok(mockBadges));

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/leaderboard/badges?category=project&isActive=true'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.badges).toEqual(mockBadges);
  });
});

describe('POST /api/leaderboard/badges', () => {
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

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/leaderboard/badges', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Badge',
        category: BadgeCategory.GENERAL,
        requirementType: RequirementType.THRESHOLD,
        requirementValue: 100,
      }),
    });
    const response = await POST(request);
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

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/leaderboard/badges', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Badge',
        category: BadgeCategory.GENERAL,
        requirementType: RequirementType.THRESHOLD,
        requirementValue: 100,
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Yetkiniz yok');
  });

  it('creates badge successfully when user is master_admin', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: 'master_admin' },
      error: null,
    });

    const createdAt = new Date();
    const updatedAt = new Date();
    const mockBadge: Badge = {
      id: 'badge-1',
      name: 'Test Badge',
      description: null,
      icon: null,
      category: BadgeCategory.GENERAL,
      requirementType: RequirementType.THRESHOLD,
      requirementValue: 100,
      requirementActivity: null,
      pointsBonus: 0,
      isActive: true,
      orderIndex: 0,
      createdAt,
      updatedAt,
    };

    mockCreateBadgeUseCaseExecute.mockResolvedValue(Result.ok(mockBadge));

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/leaderboard/badges', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Badge',
        category: BadgeCategory.GENERAL,
        requirementType: RequirementType.THRESHOLD,
        requirementValue: 100,
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.badge).toMatchObject({
      id: 'badge-1',
      name: 'Test Badge',
      category: BadgeCategory.GENERAL,
      requirementType: RequirementType.THRESHOLD,
      requirementValue: 100,
      isActive: true,
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

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/leaderboard/badges', {
      method: 'POST',
      body: JSON.stringify({
        // Missing required fields
        name: '',
      }),
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
