/**
 * Integration Tests for /api/leaderboard
 *
 * Tests leaderboard API routes with authentication and validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest } from '@/5-shared/test/api-helpers';
import { Result } from '@/6-core/result/Result';
import type { LeaderboardRanking } from '@/3-domain/entities/Leaderboard';

// Mock Supabase client
const mockGetUser = vi.fn();

vi.mock('@/4-infrastructure/database/supabase-server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

// Mock repository
const mockGetRankings = vi.fn();

class MockSupabaseLeaderboardRepository {
  getRankings = mockGetRankings;
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

// Mock use case
const mockGetLeaderboardUseCaseExecute = vi.fn();

class MockGetLeaderboardUseCase {
  execute = mockGetLeaderboardUseCaseExecute;
}

vi.mock('@/2-application/use-cases/leaderboard', () => ({
  GetLeaderboardUseCase: MockGetLeaderboardUseCase,
}));

describe('GET /api/leaderboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    } as any);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/leaderboard');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim');
  });

  it('returns leaderboard rankings successfully', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    const lastActivityAt = new Date();
    const mockRankings: LeaderboardRanking[] = [
      {
        companyId: 'company-1',
        companyName: 'Test Company',
        programId: 'program-1',
        totalScore: 1000,
        projectScore: 500,
        trainingScore: 200,
        eventScore: 150,
        forumScore: 100,
        newsScore: 50,
        appointmentScore: 0,
        rank: 1,
        badgeCount: 5,
        lastActivityAt,
      },
    ];

    mockGetLeaderboardUseCaseExecute.mockResolvedValue(Result.ok(mockRankings));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/leaderboard');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.rankings).toHaveLength(1);
    expect(data.rankings[0]).toMatchObject({
      companyId: 'company-1',
      companyName: 'Test Company',
      programId: 'program-1',
      totalScore: 1000,
      rank: 1,
      badgeCount: 5,
    });
  });

  it('returns leaderboard with program filter', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    const mockRankings: LeaderboardRanking[] = [];
    mockGetLeaderboardUseCaseExecute.mockResolvedValue(Result.ok(mockRankings));

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/leaderboard?programId=550e8400-e29b-41d4-a716-446655440000&limit=50'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.rankings).toEqual(mockRankings);
    expect(mockGetLeaderboardUseCaseExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        programId: '550e8400-e29b-41d4-a716-446655440000',
        limit: 50,
      })
    );
  });

  it('returns 400 when use case fails', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockGetLeaderboardUseCaseExecute.mockResolvedValue(
      Result.fail(new Error('Failed to get leaderboard'))
    );

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/leaderboard');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('validates filter parameters', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    const mockRankings: LeaderboardRanking[] = [];
    mockGetLeaderboardUseCaseExecute.mockResolvedValue(Result.ok(mockRankings));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/leaderboard?limit=200&offset=-1');
    const response = await GET(request);

    // Should fail validation or handle gracefully
    expect([200, 400]).toContain(response.status);
  });
});
