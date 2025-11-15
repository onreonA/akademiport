/**
 * Integration Tests for /api/forum/topics
 *
 * Tests forum topics API routes with authentication, authorization, and validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest } from '@/5-shared/test/api-helpers';
import { TopicStatus, TopicPriority } from '@/3-domain/enums/ForumEnums';
import { Result } from '@/6-core/result/Result';
import type { ForumTopic } from '@/3-domain/entities/Forum';

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
const mockFindAllTopics = vi.fn();
const mockCreateTopic = vi.fn();

class MockSupabaseForumRepository {
  findAllTopics = mockFindAllTopics;
  createTopic = mockCreateTopic;
}

vi.mock('@/4-infrastructure/database/repositories/SupabaseForumRepository', () => ({
  SupabaseForumRepository: MockSupabaseForumRepository,
}));

// Mock use cases
const mockListTopicsUseCaseExecute = vi.fn();
const mockCreateTopicUseCaseExecute = vi.fn();

class MockListTopicsUseCase {
  execute = mockListTopicsUseCaseExecute;
}

class MockCreateTopicUseCase {
  execute = mockCreateTopicUseCaseExecute;
}

vi.mock('@/2-application/use-cases/forum', () => ({
  ListTopicsUseCase: MockListTopicsUseCase,
  CreateTopicUseCase: MockCreateTopicUseCase,
}));

describe('GET /api/forum/topics', () => {
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
    const request = createMockRequest('http://localhost:3000/api/forum/topics');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim');
  });

  it('returns topics list successfully', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: {
        company_id: 'company-1',
        companies: { program_id: 'program-1' },
        role: 'company_user',
      },
      error: null,
    });

    const mockTopics = {
      topics: [
        {
          id: 'topic-1',
          categoryId: 'category-1',
          programId: 'program-1',
          authorId: 'author-1',
          companyId: 'company-1',
          title: 'Test Topic',
          slug: 'test-topic',
          content: 'Test content',
          status: TopicStatus.OPEN,
          priority: TopicPriority.NORMAL,
          isPinned: false,
          isLocked: false,
          isApproved: true,
          solutionReplyId: null,
          solvedAt: null,
          solvedBy: null,
          viewCount: 0,
          replyCount: 0,
          likeCount: 0,
          lastReplyAt: null,
          lastReplyBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      total: 1,
    };

    mockListTopicsUseCaseExecute.mockResolvedValue(Result.ok(mockTopics));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/forum/topics');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.topics).toHaveLength(1);
    expect(data.topics[0].title).toBe('Test Topic');
  });

  it('returns 404 when user data not found', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/forum/topics');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Kullanıcı bilgileri bulunamadı');
  });

  it('filters topics by isApproved for company users', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: {
        company_id: 'company-1',
        companies: { program_id: 'program-1' },
        role: 'company_user',
      },
      error: null,
    });

    mockListTopicsUseCaseExecute.mockResolvedValue(
      Result.ok({ topics: [], total: 0 })
    );

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/forum/topics');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockListTopicsUseCaseExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        isApproved: true,
      })
    );
  });
});

describe('POST /api/forum/topics', () => {
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
    const request = createMockRequest('http://localhost:3000/api/forum/topics', {
      method: 'POST',
      body: JSON.stringify({
        categoryId: 'category-1',
        title: 'Test Topic',
        content: 'Test content',
        priority: TopicPriority.NORMAL,
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim');
  });

  it('creates topic successfully', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: {
        company_id: 'company-1',
        companies: { program_id: 'program-1' },
      },
      error: null,
    });

    mockCreateTopicUseCaseExecute.mockResolvedValue(Result.ok({ id: 'topic-1' }));

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/forum/topics', {
      method: 'POST',
      body: JSON.stringify({
        categoryId: 'category-1',
        title: 'Test Topic',
        content: 'Test content',
        priority: TopicPriority.NORMAL,
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBe('topic-1');
    expect(mockCreateTopicUseCaseExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        programId: 'program-1',
        categoryId: 'category-1',
        title: 'Test Topic',
        content: 'Test content',
      }),
      mockUser.id,
      'company-1'
    );
  });

  it('returns 400 when use case fails', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: {
        company_id: 'company-1',
        companies: { program_id: 'program-1' },
      },
      error: null,
    });

    mockCreateTopicUseCaseExecute.mockResolvedValue(
      Result.fail('Kategori bulunamadı')
    );

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/forum/topics', {
      method: 'POST',
      body: JSON.stringify({
        categoryId: 'category-1',
        title: 'Test Topic',
        content: 'Test content',
        priority: TopicPriority.NORMAL,
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Kategori bulunamadı');
  });

  it('returns 404 when company not found', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: {
        company_id: null,
        companies: null,
      },
      error: null,
    });

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/forum/topics', {
      method: 'POST',
      body: JSON.stringify({
        categoryId: 'category-1',
        title: 'Test Topic',
        content: 'Test content',
        priority: TopicPriority.NORMAL,
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Firma bilgisi bulunamadı');
  });
});

