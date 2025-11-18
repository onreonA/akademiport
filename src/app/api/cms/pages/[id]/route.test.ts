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
const mockExecuteGetPage = vi.fn();
const mockExecuteUpdatePage = vi.fn();
const mockExecuteDeletePage = vi.fn();

vi.mock('@/2-application/use-cases/cms', () => ({
  GetPageUseCase: class {
    executeById = mockExecuteGetPage;
  },
  UpdatePageUseCase: class {
    execute = mockExecuteUpdatePage;
  },
  DeletePageUseCase: class {
    execute = mockExecuteDeletePage;
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

describe('GET /api/cms/pages/[id]', () => {
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
    const request = createMockRequest('http://localhost:3000/api/cms/pages/page-1');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'page-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error || data.error?.message).toBe('Yetkisiz erişim');
  });

  it('returns page successfully for master_admin', async () => {
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
    mockExecuteGetPage.mockResolvedValue(Result.ok(mockPage));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/cms/pages/page-1');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'page-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe(mockPage.id);
    expect(data.data.slug).toBe(mockPage.slug);
  });

  it('returns 403 when non-admin tries to access draft page', async () => {
    const mockUser = createMockUser({ role: UserRole.CONSULTANT });
    mockGetUser.mockResolvedValue({
      data: { user: { id: mockUser.id } },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: UserRole.CONSULTANT },
      error: null,
    });

    const mockPage = createMockPage({ status: 'draft' });
    mockExecuteGetPage.mockResolvedValue(Result.ok(mockPage));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/cms/pages/page-1');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'page-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error || data.error?.message).toBe('Yetkiniz yok');
  });

  it('returns 404 when page not found', async () => {
    const mockUser = createMockUser({ role: UserRole.MASTER_ADMIN });
    mockGetUser.mockResolvedValue({
      data: { user: { id: mockUser.id } },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: UserRole.MASTER_ADMIN },
      error: null,
    });

    mockExecuteGetPage.mockResolvedValue(Result.ok(null));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/cms/pages/nonexistent');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'nonexistent' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain('Sayfa bulunamadı');
  });
});

describe('PUT /api/cms/pages/[id]', () => {
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
    const request = createMockRequest('http://localhost:3000/api/cms/pages/page-1', {
      method: 'PUT',
      body: {
        title: 'Updated Title',
      },
    });
    const response = await PUT(request, {
      params: Promise.resolve({ id: 'page-1' }),
    });
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

    const { PUT } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/cms/pages/page-1', {
      method: 'PUT',
      body: {
        title: 'Updated Title',
      },
    });
    const response = await PUT(request, {
      params: Promise.resolve({ id: 'page-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error || data.error?.message).toBe('Yetkiniz yok');
  });

  it('updates page successfully', async () => {
    const mockUser = createMockUser({ role: UserRole.MASTER_ADMIN });
    mockGetUser.mockResolvedValue({
      data: { user: { id: mockUser.id } },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: UserRole.MASTER_ADMIN },
      error: null,
    });

    const updatedPage = createMockPage({ title: 'Updated Title' });
    mockExecuteUpdatePage.mockResolvedValue(Result.ok(updatedPage));

    const { PUT } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/cms/pages/page-1', {
      method: 'PUT',
      body: {
        title: 'Updated Title',
      },
    });
    const response = await PUT(request, {
      params: Promise.resolve({ id: 'page-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe(updatedPage.id);
    expect(data.data.title).toBe(updatedPage.title);
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

    mockExecuteUpdatePage.mockResolvedValue(Result.fail('Sayfa bulunamadı'));

    const { PUT } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/cms/pages/page-1', {
      method: 'PUT',
      body: {
        title: 'Updated Title',
      },
    });
    const response = await PUT(request, {
      params: Promise.resolve({ id: 'page-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Sayfa bulunamadı');
  });
});

describe('DELETE /api/cms/pages/[id]', () => {
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
    const request = createMockRequest('http://localhost:3000/api/cms/pages/page-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'page-1' }),
    });
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

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/cms/pages/page-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'page-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error || data.error?.message).toBe('Yetkiniz yok');
  });

  it('deletes page successfully', async () => {
    const mockUser = createMockUser({ role: UserRole.MASTER_ADMIN });
    mockGetUser.mockResolvedValue({
      data: { user: { id: mockUser.id } },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: UserRole.MASTER_ADMIN },
      error: null,
    });

    mockExecuteDeletePage.mockResolvedValue(Result.ok(undefined));

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/cms/pages/page-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'page-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Sayfa arşivlendi');
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

    mockExecuteDeletePage.mockResolvedValue(Result.fail('Sayfa bulunamadı'));

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/cms/pages/page-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'page-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Sayfa bulunamadı');
  });
});
