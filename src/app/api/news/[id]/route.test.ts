/**
 * Integration Tests for /api/news/[id]
 *
 * Tests single news API routes (GET, PUT, DELETE)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockUser } from '@/5-shared/test/api-helpers';
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
const mockFindById = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockGetNewsTags = vi.fn();

class MockSupabaseNewsRepository {
  findById = mockFindById;
  update = mockUpdate;
  delete = mockDelete;
  getNewsTags = mockGetNewsTags;
}

vi.mock('@/4-infrastructure/database/repositories/SupabaseNewsRepository', () => ({
  SupabaseNewsRepository: MockSupabaseNewsRepository,
}));

// Mock use cases
const mockUpdateNewsUseCaseExecute = vi.fn();

class MockUpdateNewsUseCase {
  execute = mockUpdateNewsUseCaseExecute;
}

vi.mock('@/2-application/use-cases/news', () => ({
  UpdateNewsUseCase: MockUpdateNewsUseCase,
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

describe('GET /api/news/[id]', () => {
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
    const request = createMockRequest('http://localhost:3000/api/news/news-1');
    const response = await GET(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim');
  });

  it('returns news successfully', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    const mockNews = createMockNews();
    mockFindById.mockResolvedValue(Result.ok(mockNews));
    mockGetNewsTags.mockResolvedValue(Result.ok([]));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news/news-1');
    const response = await GET(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe('news-1');
    expect(data.title).toBe('Test News');
  });

  it('returns 404 when news not found', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockFindById.mockResolvedValue(Result.ok(null));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news/non-existent');
    const response = await GET(request, { params: Promise.resolve({ id: 'non-existent' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Haber bulunamadı');
  });

  it('returns 500 on error', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockFindById.mockRejectedValue(new Error('Database error'));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news/news-1');
    const response = await GET(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Haber getirilemedi');
  });
});

describe('PUT /api/news/[id]', () => {
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

    const { PUT } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news/news-1', {
      method: 'PUT',
      body: {},
    });
    const response = await PUT(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim');
  });

  it('returns 403 when user is not admin or consultant', async () => {
    const { createClient } = await import('@/infrastructure/database/supabase-server');
    const mockClient = createClient();
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    vi.mocked(mockClient.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    vi.mocked(mockClient.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { role: UserRole.COMPANY_USER },
            error: null,
          }),
        })),
      })),
    } as any);

    const { PUT } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news/news-1', {
      method: 'PUT',
      body: {},
    });
    const response = await PUT(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Yetkiniz yok');
  });

  it('updates news successfully', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: UserRole.MASTER_ADMIN },
      error: null,
    });

    const updatedNews = { ...createMockNews(), title: 'Updated Title' };
    mockUpdateNewsUseCaseExecute.mockResolvedValue(Result.ok(updatedNews));

    const { PUT } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news/news-1', {
      method: 'PUT',
      body: {
        title: 'Updated Title',
      },
    });
    const response = await PUT(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.title).toBe('Updated Title');
  });

  it('returns 400 on validation error', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: UserRole.MASTER_ADMIN },
      error: null,
    });

    mockUpdateNewsUseCaseExecute.mockResolvedValue(Result.fail('Haber başlığı gereklidir'));

    const { PUT } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news/news-1', {
      method: 'PUT',
      body: {
        title: '',
      },
    });
    const response = await PUT(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Haber başlığı gereklidir');
  });
});

describe('DELETE /api/news/[id]', () => {
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
    const request = createMockRequest('http://localhost:3000/api/news/news-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim');
  });

  it('returns 403 when user is not admin or consultant', async () => {
    const { createClient } = await import('@/infrastructure/database/supabase-server');
    const mockClient = createClient();
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    vi.mocked(mockClient.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    vi.mocked(mockClient.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { role: UserRole.COMPANY_USER },
            error: null,
          }),
        })),
      })),
    } as any);

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news/news-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Yetkiniz yok');
  });

  it('deletes news successfully', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: UserRole.MASTER_ADMIN },
      error: null,
    });

    mockDelete.mockResolvedValue(Result.ok(undefined));

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news/news-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Haber silindi');
  });

  it('returns 400 on delete error', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: UserRole.MASTER_ADMIN },
      error: null,
    });

    mockDelete.mockResolvedValue(Result.fail('Haber silinemedi'));

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news/news-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Haber silinemedi');
  });
});
