/**
 * Integration Tests for /api/news
 *
 * Tests news API routes with authentication, authorization, and validation
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
const mockFindAll = vi.fn();
const mockCreate = vi.fn();

class MockSupabaseNewsRepository {
  findAll = mockFindAll;
  create = mockCreate;
}

vi.mock('@/4-infrastructure/database/repositories/SupabaseNewsRepository', () => ({
  SupabaseNewsRepository: MockSupabaseNewsRepository,
}));

// Mock use cases
const mockGetNewsListUseCaseExecute = vi.fn();
const mockCreateNewsUseCaseExecute = vi.fn();

class MockGetNewsListUseCase {
  execute = mockGetNewsListUseCaseExecute;
}

class MockCreateNewsUseCase {
  execute = mockCreateNewsUseCaseExecute;
}

vi.mock('@/2-application/use-cases/news', () => ({
  GetNewsListUseCase: MockGetNewsListUseCase,
  CreateNewsUseCase: MockCreateNewsUseCase,
}));

describe('GET /api/news', () => {
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
    const request = createMockRequest('http://localhost:3000/api/news');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim');
  });

  it('returns news list successfully', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    const mockNews: News[] = [
      {
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
      },
    ];

    mockGetNewsListUseCaseExecute.mockResolvedValue(Result.ok(mockNews));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(1);
    expect(data[0].title).toBe('Test News');
  });

  it('handles filters correctly', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockGetNewsListUseCaseExecute.mockResolvedValue(Result.ok([]));

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/news?programId=program-1&category=e_commerce&status=published'
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockGetNewsListUseCaseExecute).toHaveBeenCalled();
  });

  it('returns 500 on error', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockGetNewsListUseCaseExecute.mockRejectedValue(new Error('Database error'));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Haberler listelenemedi');
  });
});

describe('POST /api/news', () => {
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
    const request = createMockRequest('http://localhost:3000/api/news', {
      method: 'POST',
      body: {},
    });
    const response = await POST(request);
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

    // Mock user query to return company user
    mockSingle.mockResolvedValue({
      data: { role: UserRole.COMPANY_USER },
      error: null,
    });

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news', {
      method: 'POST',
      body: {},
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Yetkiniz yok');
  });

  it('creates news successfully', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    // Mock user query to return admin
    mockSingle.mockResolvedValue({
      data: { role: UserRole.MASTER_ADMIN },
      error: null,
    });

    const mockNews: News = {
      id: 'news-1',
      programId: 'program-1',
      authorId: 'user-1',
      title: 'Test News',
      slug: 'test-news',
      summary: 'Test summary',
      content: 'Test content',
      category: NewsCategory.GENERAL,
      status: NewsStatus.DRAFT,
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
      publishedAt: null,
      archivedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user-1',
      updatedBy: 'user-1',
    };

    mockCreateNewsUseCaseExecute.mockResolvedValue(Result.ok(mockNews));

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news', {
      method: 'POST',
      body: {
        programId: 'program-1',
        title: 'Test News',
        content: 'Test content',
        category: NewsCategory.GENERAL,
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBe('news-1');
    expect(data.title).toBe('Test News');
  });

  it('returns 400 on validation error', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    // Mock user query to return admin
    mockSingle.mockResolvedValue({
      data: { role: UserRole.MASTER_ADMIN },
      error: null,
    });

    mockCreateNewsUseCaseExecute.mockResolvedValue(Result.fail('Haber başlığı gereklidir'));

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news', {
      method: 'POST',
      body: {
        programId: 'program-1',
        content: 'Test content',
        category: NewsCategory.GENERAL,
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Haber başlığı gereklidir');
  });

  it('returns 500 on error', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    // Mock user query to return admin
    mockSingle.mockResolvedValue({
      data: { role: UserRole.MASTER_ADMIN },
      error: null,
    });

    mockCreateNewsUseCaseExecute.mockRejectedValue(new Error('Database error'));

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news', {
      method: 'POST',
      body: {},
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Haber oluşturulamadı');
  });
});
