/**
 * Integration Tests for /api/news/[id]/like
 *
 * Tests news like/unlike API routes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest } from '@/5-shared/test/api-helpers';
import { Result } from '@/6-core/result/Result';
import type { NewsLike } from '@/3-domain/entities/News';

// Mock Supabase client
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

vi.mock('@/infrastructure/database/supabase-server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}));

// Mock repository
const mockLikeNews = vi.fn();
const mockUnlikeNews = vi.fn();

class MockSupabaseNewsRepository {
  likeNews = mockLikeNews;
  unlikeNews = mockUnlikeNews;
}

vi.mock('@/4-infrastructure/database/repositories/SupabaseNewsRepository', () => ({
  SupabaseNewsRepository: MockSupabaseNewsRepository,
}));

const createMockLike = (): NewsLike => ({
  id: 'like-1',
  newsId: 'news-1',
  userId: 'user-1',
  companyId: 'company-1',
  createdAt: new Date(),
});

describe('POST /api/news/[id]/like', () => {
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
    const request = createMockRequest('http://localhost:3000/api/news/news-1/like', {
      method: 'POST',
    });
    const response = await POST(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim');
  });

  it('likes news successfully', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { company_id: 'company-1' },
      error: null,
    });

    const mockLike = createMockLike();
    mockLikeNews.mockResolvedValue(Result.ok(mockLike));

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news/news-1/like', {
      method: 'POST',
    });
    const response = await POST(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe('like-1');
    expect(mockLikeNews).toHaveBeenCalledWith('news-1', 'user-1', 'company-1');
  });

  it('handles missing company_id', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { company_id: null },
      error: null,
    });

    const mockLike = createMockLike();
    mockLikeNews.mockResolvedValue(Result.ok(mockLike));

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news/news-1/like', {
      method: 'POST',
    });
    const response = await POST(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockLikeNews).toHaveBeenCalledWith('news-1', 'user-1', null);
  });

  it('returns 400 on error', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { company_id: 'company-1' },
      error: null,
    });

    mockLikeNews.mockResolvedValue(Result.fail('Beğeni eklenemedi'));

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news/news-1/like', {
      method: 'POST',
    });
    const response = await POST(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Beğeni eklenemedi');
  });
});

describe('DELETE /api/news/[id]/like', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    } as any);

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news/news-1/like', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim');
  });

  it('unlikes news successfully', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockUnlikeNews.mockResolvedValue(Result.ok(undefined));

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news/news-1/like', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Beğeni kaldırıldı');
    expect(mockUnlikeNews).toHaveBeenCalledWith('news-1', 'user-1');
  });

  it('returns 400 on error', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockUnlikeNews.mockResolvedValue(Result.fail('Beğeni kaldırılamadı'));

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news/news-1/like', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Beğeni kaldırılamadı');
  });
});

