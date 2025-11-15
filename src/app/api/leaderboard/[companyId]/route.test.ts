/**
 * Integration Tests for /api/leaderboard/[companyId]
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest } from '@/5-shared/test/api-helpers';
import { Result } from '@/6-core/result/Result';
import type { LeaderboardRanking } from '@/3-domain/entities/Leaderboard';

const mockGetUser = vi.fn();

vi.mock('@/4-infrastructure/database/supabase-server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

const mockGetCompanyRankingUseCaseExecute = vi.fn();

class MockGetCompanyRankingUseCase {
  execute = mockGetCompanyRankingUseCaseExecute;
}

vi.mock('@/2-application/use-cases/leaderboard', () => ({
  GetCompanyRankingUseCase: MockGetCompanyRankingUseCase,
}));

describe('GET /api/leaderboard/[companyId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    } as any);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/leaderboard/company-1');
    const response = await GET(request, {
      params: Promise.resolve({ companyId: 'company-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim');
  });

  it('returns 400 when programId is missing', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/leaderboard/company-1');
    const response = await GET(request, {
      params: Promise.resolve({ companyId: 'company-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('programId gerekli');
  });

  it('returns company ranking successfully', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    const mockRanking: LeaderboardRanking = {
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
      lastActivityAt: new Date(),
    };

    mockGetCompanyRankingUseCaseExecute.mockResolvedValue(Result.ok(mockRanking));

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/leaderboard/company-1?programId=program-1'
    );
    const response = await GET(request, {
      params: Promise.resolve({ companyId: 'company-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ranking).toMatchObject({
      companyId: 'company-1',
      companyName: 'Test Company',
      programId: 'program-1',
      totalScore: 1000,
      rank: 1,
    });
    expect(mockGetCompanyRankingUseCaseExecute).toHaveBeenCalledWith('company-1', 'program-1');
  });

  it('returns null when company has no ranking', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockGetCompanyRankingUseCaseExecute.mockResolvedValue(Result.ok(null));

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/leaderboard/company-1?programId=program-1'
    );
    const response = await GET(request, {
      params: Promise.resolve({ companyId: 'company-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ranking).toBeNull();
  });

  it('returns 400 when use case fails', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockGetCompanyRankingUseCaseExecute.mockResolvedValue(Result.fail('Failed to get ranking'));

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/leaderboard/company-1?programId=program-1'
    );
    const response = await GET(request, {
      params: Promise.resolve({ companyId: 'company-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});
