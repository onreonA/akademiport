/**
 * Integration Tests for /api/news/[id]/publish
 *
 * Tests news publish API route
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest } from '@/5-shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';
import { NewsCategory, NewsStatus } from '@/3-domain/enums/NewsEnums';
import { Result } from '@/6-core/result/Result';
import type { News } from '@/3-domain/entities/News';

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
const mockPublish = vi.fn();

class MockSupabaseNewsRepository {
  publish = mockPublish;
}

vi.mock('@/4-infrastructure/database/repositories/SupabaseNewsRepository', () => ({
  SupabaseNewsRepository: MockSupabaseNewsRepository,
}));

// Mock use cases
const mockPublishNewsUseCaseExecute = vi.fn();

class MockPublishNewsUseCase {
  execute = mockPublishNewsUseCaseExecute;
}

vi.mock('@/2-application/use-cases/news', () => ({
  PublishNewsUseCase: MockPublishNewsUseCase,
}));

const createMockNews = (): News => ({
  id: 'news-1',
  programId: 'program-1',
  authorId: 'author-1',
  title: 'Test News',
  slug: 'test-news',
  summary: 'Test summary',
  content: 'Test content',
  category: NewsCategory.GENERAL,
  status: NewsStatus.PUBLISHED,
  imageUrl: null,
  imageAlt: null,
  metaDescription: null,
  metaKeywords: null,
  isFeatured: false,
  isPinned: false,
  readingTime: 1,
  viewCount: 0,
  likeCount: 0,
  commentCount: 0,
  publishedAt: new Date(),
  archivedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'author-1',
  updatedBy: 'author-1',
});

describe('POST /api/news/[id]/publish', () => {
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
    const request = createMockRequest('http://localhost:3000/api/news/news-1/publish', {
      method: 'POST',
    });
    const response = await POST(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim');
  });

  it('returns 403 when user is not admin or consultant', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: UserRole.COMPANY_USER },
      error: null,
    });

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news/news-1/publish', {
      method: 'POST',
    });
    const response = await POST(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Yetkiniz yok');
  });

  it('publishes news successfully', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: UserRole.MASTER_ADMIN },
      error: null,
    });

    const publishedNews = createMockNews();
    mockPublishNewsUseCaseExecute.mockResolvedValue(Result.ok(publishedNews));

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news/news-1/publish', {
      method: 'POST',
    });
    const response = await POST(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe(NewsStatus.PUBLISHED);
    expect(mockPublishNewsUseCaseExecute).toHaveBeenCalledWith('news-1', 'user-1');
  });

  it('returns 400 when news already published', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: UserRole.MASTER_ADMIN },
      error: null,
    });

    mockPublishNewsUseCaseExecute.mockResolvedValue(Result.fail('Haber zaten yayında'));

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news/news-1/publish', {
      method: 'POST',
    });
    const response = await POST(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Haber zaten yayında');
  });

  it('returns 500 on error', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: UserRole.MASTER_ADMIN },
      error: null,
    });

    mockPublishNewsUseCaseExecute.mockRejectedValue(new Error('Database error'));

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news/news-1/publish', {
      method: 'POST',
    });
    const response = await POST(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Haber yayınlanamadı');
  });
});

