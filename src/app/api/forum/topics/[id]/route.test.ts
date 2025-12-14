/**
 * Integration Tests for /api/forum/topics/[id]
 *
 * Tests forum topic detail API routes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest } from '@/5-shared/test/api-helpers';
import { TopicStatus, TopicPriority } from '@/3-domain/enums/ForumEnums';
import { Result } from '@/6-core/result/Result';

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
const mockFindTopicById = vi.fn();
const mockUpdateTopic = vi.fn();
const mockDeleteTopic = vi.fn();
const mockIncrementViewCount = vi.fn();
const mockFindTopicBySlug = vi.fn();

class MockSupabaseForumRepository {
  findTopicById = mockFindTopicById;
  updateTopic = mockUpdateTopic;
  deleteTopic = mockDeleteTopic;
  incrementViewCount = mockIncrementViewCount;
  findTopicBySlug = mockFindTopicBySlug;
}

vi.mock('@/4-infrastructure/database/repositories/SupabaseForumRepository', () => ({
  SupabaseForumRepository: MockSupabaseForumRepository,
}));

// Mock use cases
const mockUpdateTopicExecute = vi.fn();
const mockDeleteTopicExecute = vi.fn();

vi.mock('@/2-application/use-cases/forum', () => ({
  UpdateTopicUseCase: class {
    constructor() {}
    execute = mockUpdateTopicExecute;
  },
  DeleteTopicUseCase: class {
    constructor() {}
    execute = mockDeleteTopicExecute;
  },
}));

describe('GET /api/forum/topics/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    } as any);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/forum/topics/topic-1');
    const response = await GET(request, { params: Promise.resolve({ id: 'topic-1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim');
  });

  it('returns topic detail successfully', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    const mockTopic = {
      id: 'topic-1',
      title: 'Test Topic',
      content: 'Test content',
      status: TopicStatus.OPEN,
      priority: TopicPriority.NORMAL,
      isPinned: false,
      isLocked: false,
      isApproved: true,
      viewCount: 10,
      replyCount: 5,
      likeCount: 3,
    };

    mockFindTopicById.mockResolvedValue(Result.ok(mockTopic));
    mockIncrementViewCount.mockResolvedValue(Result.ok(undefined));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/forum/topics/topic-1');
    const response = await GET(request, { params: Promise.resolve({ id: 'topic-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe('topic-1');
    expect(data.title).toBe('Test Topic');
  });

  it('returns 404 when topic not found', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockFindTopicById.mockResolvedValue(Result.ok(null));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/forum/topics/topic-1');
    const response = await GET(request, { params: Promise.resolve({ id: 'topic-1' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Konu bulunamadı');
  });
});

describe('PUT /api/forum/topics/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset use case mocks
    mockUpdateTopicExecute.mockClear();
    mockFindTopicBySlug.mockClear();
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    } as any);

    const { PUT } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/forum/topics/topic-1', {
      method: 'PUT',
      body: JSON.stringify({
        title: 'Updated Topic',
        content: 'Updated content',
      }),
    });
    const response = await PUT(request, { params: Promise.resolve({ id: 'topic-1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim');
  });

  it('updates topic successfully', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    const updatedTopic = {
      id: 'topic-1',
      title: 'Updated Topic',
      content: 'Updated content',
    };

    const existingTopic = {
      id: 'topic-1',
      authorId: mockUser.id,
      title: 'Original Topic',
      programId: 'program-1',
      slug: 'original-topic',
      categoryId: 'category-1',
      content: 'Original content',
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
      companyId: null,
    };

    // Mock repository methods that UpdateTopicUseCase will call
    mockFindTopicById.mockResolvedValue(Result.ok(existingTopic));
    // Mock findTopicBySlug to return not found (slug doesn't exist)
    mockFindTopicBySlug.mockResolvedValue(Result.ok(null));
    mockUpdateTopic.mockResolvedValue(Result.ok({ ...existingTopic, ...updatedTopic }));

    mockFrom.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });
    mockSingle.mockResolvedValue({
      data: { role: 'master_admin' },
      error: null,
    });
    // Mock UpdateTopicUseCase.execute - it will use repository mocks internally
    mockUpdateTopicExecute.mockResolvedValue(Result.ok({ ...existingTopic, ...updatedTopic }));

    const { PUT } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/forum/topics/topic-1', {
      method: 'PUT',
      body: JSON.stringify({
        title: 'Updated Topic',
        content: 'Updated content',
      }),
    });
    const response = await PUT(request, { params: Promise.resolve({ id: 'topic-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.title).toBe('Updated Topic');
  });

  it('returns 400 when update fails', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    const existingTopic = {
      id: 'topic-1',
      authorId: mockUser.id,
      title: 'Original Topic',
      programId: 'program-1',
      slug: 'original-topic',
      categoryId: 'category-1',
      content: 'Original content',
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
      companyId: null,
    };

    // Mock repository methods that UpdateTopicUseCase will call
    mockFindTopicById.mockResolvedValue(Result.ok(existingTopic));
    // Mock findTopicBySlug to return not found (slug doesn't exist)
    mockFindTopicBySlug.mockResolvedValue(Result.ok(null));

    mockFrom.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });
    mockSingle.mockResolvedValue({
      data: { role: 'master_admin' },
      error: null,
    });
    // Mock UpdateTopicUseCase.execute to return failure
    mockUpdateTopicExecute.mockResolvedValue(Result.fail('Konu güncellenemedi'));

    const { PUT } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/forum/topics/topic-1', {
      method: 'PUT',
      body: JSON.stringify({
        title: 'Updated Topic',
        content: 'Updated content',
      }),
    });
    const response = await PUT(request, { params: Promise.resolve({ id: 'topic-1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    // Error message might be prefixed by route error handling
    expect(data.error).toContain('Konu güncellenemedi');
  });
});

describe('DELETE /api/forum/topics/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset use case mocks
    mockDeleteTopicExecute.mockClear();
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    } as any);

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/forum/topics/topic-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'topic-1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim');
  });

  it('deletes topic successfully', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    const existingTopic = {
      id: 'topic-1',
      authorId: mockUser.id,
      title: 'Test Topic',
      programId: 'program-1',
      slug: 'test-topic',
      categoryId: 'category-1',
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
      companyId: null,
    };

    // Mock repository methods that DeleteTopicUseCase will call
    mockFindTopicById.mockResolvedValue(Result.ok(existingTopic));
    mockDeleteTopic.mockResolvedValue(Result.ok(undefined));

    mockFrom.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });
    mockSingle.mockResolvedValue({
      data: { role: 'master_admin' },
      error: null,
    });
    // Mock DeleteTopicUseCase.execute - it will use repository mocks internally
    mockDeleteTopicExecute.mockResolvedValue(Result.ok(undefined));

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/forum/topics/topic-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'topic-1' }) });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe('Konu silindi');
  });

  it('returns 400 when delete fails', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    const existingTopic = {
      id: 'topic-1',
      authorId: mockUser.id,
      title: 'Test Topic',
      programId: 'program-1',
      slug: 'test-topic',
      categoryId: 'category-1',
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
      companyId: null,
    };

    mockFindTopicById.mockResolvedValue(Result.ok(existingTopic));
    mockFrom.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });
    mockSingle.mockResolvedValue({
      data: { role: 'master_admin' },
      error: null,
    });
    // Mock DeleteTopicUseCase.execute to return failure
    mockDeleteTopicExecute.mockResolvedValue(Result.fail('Konu silinemedi'));

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/forum/topics/topic-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'topic-1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Konu silinemedi');
  });
});
