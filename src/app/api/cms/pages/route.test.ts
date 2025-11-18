import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockRequest, createMockUser } from '@/5-shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';
import { Result } from '@/6-core/result/Result';
import { CMSPage } from '@/3-domain/entities/CMSPage';

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

// Mock use cases
const mockExecuteGetPages = vi.fn();
const mockExecuteCreatePage = vi.fn();

vi.mock('@/2-application/use-cases/cms', () => ({
  GetPagesUseCase: class {
    execute = mockExecuteGetPages;
  },
  CreatePageUseCase: class {
    execute = mockExecuteCreatePage;
  },
}));

// Mock repository
vi.mock('@/4-infrastructure/database/repositories/SupabaseCMSPageRepository', () => ({
  SupabaseCMSPageRepository: vi.fn(),
}));

const createMockPage = (overrides?: Partial<CMSPage>): CMSPage => ({
  id: 'page-1',
  slug: 'test-page',
  title: 'Test Page',
  content: [],
  status: 'draft',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('GET /api/cms/pages', () => {
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
    const request = createMockRequest('http://localhost:3000/api/cms/pages');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error || data.error?.message).toBe('Yetkisiz erişim');
  });

  it('returns 403 when user is not master_admin', async () => {
    const mockUser = createMockUser({ role: UserRole.CONSULTANT });
    mockGetUser.mockResolvedValue({
      data: { user: { id: mockUser.id } },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: UserRole.CONSULTANT },
      error: null,
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/cms/pages');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error || data.error?.message).toBe('Yetkiniz yok');
  });

  it('returns pages successfully', async () => {
    const mockUser = createMockUser({ role: UserRole.MASTER_ADMIN });
    mockGetUser.mockResolvedValue({
      data: { user: { id: mockUser.id } },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: UserRole.MASTER_ADMIN },
      error: null,
    });

    const mockPages = [createMockPage(), createMockPage({ id: 'page-2', slug: 'page-2' })];
    mockExecuteGetPages.mockResolvedValue(Result.ok(mockPages));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/cms/pages');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(mockPages.length);
    expect(data.data[0].id).toBe(mockPages[0].id);
    expect(data.data[0].slug).toBe(mockPages[0].slug);
  });

  it('applies filters from query params', async () => {
    const mockUser = createMockUser({ role: UserRole.MASTER_ADMIN });
    mockGetUser.mockResolvedValue({
      data: { user: { id: mockUser.id } },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: UserRole.MASTER_ADMIN },
      error: null,
    });

    const mockPages = [createMockPage({ status: 'published' })];
    mockExecuteGetPages.mockResolvedValue(Result.ok(mockPages));

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/cms/pages?status=published&search=test'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockExecuteGetPages).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'published',
        search: 'test',
      })
    );
  });
});

describe('POST /api/cms/pages', () => {
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
    const request = createMockRequest('http://localhost:3000/api/cms/pages', {
      method: 'POST',
      body: {
        slug: 'test-page',
        title: 'Test Page',
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error || data.error?.message).toBe('Yetkisiz erişim');
  });

  it('returns 403 when user is not master_admin', async () => {
    const mockUser = createMockUser({ role: UserRole.CONSULTANT });
    mockGetUser.mockResolvedValue({
      data: { user: { id: mockUser.id } },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: UserRole.CONSULTANT },
      error: null,
    });

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/cms/pages', {
      method: 'POST',
      body: {
        slug: 'test-page',
        title: 'Test Page',
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error || data.error?.message).toBe('Yetkiniz yok');
  });

  it('creates page successfully', async () => {
    const mockUser = createMockUser({ role: UserRole.MASTER_ADMIN });
    mockGetUser.mockResolvedValue({
      data: { user: { id: mockUser.id } },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: UserRole.MASTER_ADMIN },
      error: null,
    });

    const mockPage = createMockPage();
    mockExecuteCreatePage.mockResolvedValue(Result.ok(mockPage));

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/cms/pages', {
      method: 'POST',
      body: {
        slug: 'test-page',
        title: 'Test Page',
        content: [],
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe(mockPage.id);
    expect(data.data.slug).toBe(mockPage.slug);
    expect(mockExecuteCreatePage).toHaveBeenCalled();
  });

  it('returns 400 when use case fails', async () => {
    const mockUser = createMockUser({ role: UserRole.MASTER_ADMIN });
    mockGetUser.mockResolvedValue({
      data: { user: { id: mockUser.id } },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: UserRole.MASTER_ADMIN },
      error: null,
    });

    mockExecuteCreatePage.mockResolvedValue(Result.fail('Slug zaten kullanılıyor'));

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/cms/pages', {
      method: 'POST',
      body: {
        slug: 'existing-page',
        title: 'Test Page',
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Slug zaten kullanılıyor');
  });
});
