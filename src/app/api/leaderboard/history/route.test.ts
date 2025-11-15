/**
 * Integration Tests for /api/leaderboard/history
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest } from '@/5-shared/test/api-helpers';
import { Result } from '@/6-core/result/Result';
import type { LeaderboardHistory } from '@/3-domain/entities/Leaderboard';

const mockGetUser = vi.fn();

vi.mock('@/4-infrastructure/database/supabase-server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

const mockGetLeaderboardHistoryUseCaseExecute = vi.fn();

class MockGetLeaderboardHistoryUseCase {
  execute = mockGetLeaderboardHistoryUseCaseExecute;
}

vi.mock('@/2-application/use-cases/leaderboard', () => ({
  GetLeaderboardHistoryUseCase: MockGetLeaderboardHistoryUseCase,
}));

describe('GET /api/leaderboard/history', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    } as any);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/leaderboard/history');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim');
  });

  it('returns leaderboard history successfully', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    const mockHistory: LeaderboardHistory[] = [
      {
        id: 'history-1',
        companyId: 'company-1',
        programId: 'program-1',
        snapshotDate: new Date('2024-01-01'),
        totalScore: 1000,
        projectScore: 500,
        trainingScore: 200,
        eventScore: 150,
        forumScore: 100,
        newsScore: 50,
        appointmentScore: 0,
        rank: 1,
        badgeCount: 5,
        createdAt: new Date(),
      },
    ];

    mockGetLeaderboardHistoryUseCaseExecute.mockResolvedValue(Result.ok(mockHistory));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/leaderboard/history');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.history).toHaveLength(1);
    expect(data.history[0]).toMatchObject({
      companyId: 'company-1',
      programId: 'program-1',
      totalScore: 1000,
      rank: 1,
    });
  });

  it('returns history with company filter', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    const mockHistory: LeaderboardHistory[] = [];
    mockGetLeaderboardHistoryUseCaseExecute.mockResolvedValue(Result.ok(mockHistory));

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/leaderboard/history?companyId=company-1&programId=program-1'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.history).toEqual(mockHistory);
    expect(mockGetLeaderboardHistoryUseCaseExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: 'company-1',
        programId: 'program-1',
      })
    );
  });

  it('returns history with date range filter', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    const mockHistory: LeaderboardHistory[] = [];
    mockGetLeaderboardHistoryUseCaseExecute.mockResolvedValue(Result.ok(mockHistory));

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/leaderboard/history?startDate=2024-01-01&endDate=2024-12-31'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.history).toEqual(mockHistory);
    expect(mockGetLeaderboardHistoryUseCaseExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      })
    );
  });

  it('returns empty array when no history found', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockGetLeaderboardHistoryUseCaseExecute.mockResolvedValue(Result.ok([]));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/leaderboard/history');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.history).toEqual([]);
  });

  it('returns 400 when use case fails', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockGetLeaderboardHistoryUseCaseExecute.mockResolvedValue(Result.fail('Failed to get history'));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/leaderboard/history');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});



