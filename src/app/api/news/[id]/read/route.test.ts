/**
 * Integration Tests for /api/news/[id]/read
 *
 * Tests news read recording API route (for leaderboard)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest } from '@/5-shared/test/api-helpers';
import { Result } from '@/6-core/result/Result';
import type { NewsRead } from '@/3-domain/entities/News';

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
const mockRecordRead = vi.fn();

class MockSupabaseNewsRepository {
  recordRead = mockRecordRead;
}

vi.mock('@/4-infrastructure/database/repositories/SupabaseNewsRepository', () => ({
  SupabaseNewsRepository: MockSupabaseNewsRepository,
}));

// Mock use cases
const mockRecordNewsReadUseCaseExecute = vi.fn();

class MockRecordNewsReadUseCase {
  execute = mockRecordNewsReadUseCaseExecute;
}

vi.mock('@/2-application/use-cases/news', () => ({
  RecordNewsReadUseCase: MockRecordNewsReadUseCase,
}));

const createMockRead = (): NewsRead => ({
  id: 'read-1',
  newsId: 'news-1',
  userId: 'user-1',
  companyId: 'company-1',
  readDuration: 120,
  completed: false,
  scrollPercentage: 50,
  createdAt: new Date(),
});

describe('POST /api/news/[id]/read', () => {
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
    const request = createMockRequest('http://localhost:3000/api/news/news-1/read', {
      method: 'POST',
      body: {},
    });
    const response = await POST(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim');
  });

  it('returns 400 when company_id is missing', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news/news-1/read', {
      method: 'POST',
      body: {},
    });
    const response = await POST(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Şirket bilgisi bulunamadı');
  });

  it('records read successfully', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { company_id: 'company-1' },
      error: null,
    });

    const mockRead = createMockRead();
    mockRecordNewsReadUseCaseExecute.mockResolvedValue(Result.ok(mockRead));

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news/news-1/read', {
      method: 'POST',
      body: {
        readDuration: 120,
        scrollPercentage: 50,
      },
    });
    const response = await POST(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe('read-1');
    expect(mockRecordNewsReadUseCaseExecute).toHaveBeenCalled();
  });

  it('sets completed to true when scrollPercentage >= 80', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { company_id: 'company-1' },
      error: null,
    });

    const mockRead = { ...createMockRead(), completed: true, scrollPercentage: 85 };
    mockRecordNewsReadUseCaseExecute.mockResolvedValue(Result.ok(mockRead));

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news/news-1/read', {
      method: 'POST',
      body: {
        scrollPercentage: 85,
      },
    });
    const response = await POST(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.completed).toBe(true);
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

    mockRecordNewsReadUseCaseExecute.mockResolvedValue(Result.fail('Okuma kaydedilemedi'));

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news/news-1/read', {
      method: 'POST',
      body: {},
    });
    const response = await POST(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Okuma kaydedilemedi');
  });

  it('returns 500 on error', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { company_id: 'company-1' },
      error: null,
    });

    mockRecordNewsReadUseCaseExecute.mockRejectedValue(new Error('Database error'));

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/news/news-1/read', {
      method: 'POST',
      body: {},
    });
    const response = await POST(request, { params: Promise.resolve({ id: 'news-1' }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Okuma kaydedilemedi');
  });
});
