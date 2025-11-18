import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockRequest, createMockUser } from '@/5-shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';
import { Result } from '@/6-core/result/Result';
import { CMSSettings } from '@/3-domain/entities/CMSSettings';

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
const mockExecuteGetAll = vi.fn();
const mockExecuteGetByCategory = vi.fn();
const mockExecuteUpdateMany = vi.fn();

vi.mock('@/2-application/use-cases/cms', () => ({
  GetSettingsUseCase: class {
    executeAll = mockExecuteGetAll;
    executeByCategory = mockExecuteGetByCategory;
  },
  UpdateSettingsUseCase: class {
    executeMany = mockExecuteUpdateMany;
  },
}));

// Mock repository
vi.mock('@/4-infrastructure/database/repositories/SupabaseCMSSettingsRepository', () => ({
  SupabaseCMSSettingsRepository: vi.fn(),
}));

const createMockSetting = (overrides?: Partial<CMSSettings>): CMSSettings => ({
  id: 'setting-1',
  key: 'site_name',
  value: 'Akademi Port',
  category: 'general',
  updatedAt: new Date(),
  ...overrides,
});

describe('GET /api/cms/settings', () => {
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
    const request = createMockRequest('http://localhost:3000/api/cms/settings');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error || data.error?.message).toBe('Yetkisiz erişim');
  });

  it('returns all settings successfully', async () => {
    const mockUser = createMockUser();
    mockGetUser.mockResolvedValue({
      data: { user: { id: mockUser.id } },
      error: null,
    } as any);

    const mockSettings = [
      createMockSetting({ key: 'site_name' }),
      createMockSetting({ key: 'contact_email', category: 'contact' }),
    ];
    mockExecuteGetAll.mockResolvedValue(Result.ok(mockSettings));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/cms/settings');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(mockSettings.length);
    expect(data.data[0].key).toBe(mockSettings[0].key);
  });

  it('returns settings by category', async () => {
    const mockUser = createMockUser();
    mockGetUser.mockResolvedValue({
      data: { user: { id: mockUser.id } },
      error: null,
    } as any);

    const mockSettings = [
      createMockSetting({ key: 'contact_email', category: 'contact' }),
      createMockSetting({ key: 'contact_phone', category: 'contact' }),
    ];
    mockExecuteGetByCategory.mockResolvedValue(Result.ok(mockSettings));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/cms/settings?category=contact');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(mockSettings.length);
    expect(data.data[0].key).toBe(mockSettings[0].key);
    expect(mockExecuteGetByCategory).toHaveBeenCalledWith('contact');
  });
});

describe('PUT /api/cms/settings', () => {
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
    const request = createMockRequest('http://localhost:3000/api/cms/settings', {
      method: 'PUT',
      body: {
        site_name: 'Updated Name',
      },
    });
    const response = await PUT(request);
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
    const request = createMockRequest('http://localhost:3000/api/cms/settings', {
      method: 'PUT',
      body: {
        site_name: 'Updated Name',
      },
    });
    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error || data.error?.message).toBe('Yetkiniz yok');
  });

  it('updates settings successfully', async () => {
    const mockUser = createMockUser({ role: UserRole.MASTER_ADMIN });
    mockGetUser.mockResolvedValue({
      data: { user: { id: mockUser.id } },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: UserRole.MASTER_ADMIN },
      error: null,
    });

    const updatedSettings = [createMockSetting({ key: 'site_name', value: 'Updated Name' })];
    mockExecuteUpdateMany.mockResolvedValue(Result.ok(updatedSettings));

    const { PUT } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/cms/settings', {
      method: 'PUT',
      body: {
        site_name: 'Updated Name',
      },
    });
    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(updatedSettings.length);
    expect(data.data[0].key).toBe(updatedSettings[0].key);
    expect(data.data[0].value).toBe(updatedSettings[0].value);
    expect(mockExecuteUpdateMany).toHaveBeenCalledWith({ site_name: 'Updated Name' }, mockUser.id);
  });

  it('handles settings object in body.settings', async () => {
    const mockUser = createMockUser({ role: UserRole.MASTER_ADMIN });
    mockGetUser.mockResolvedValue({
      data: { user: { id: mockUser.id } },
      error: null,
    } as any);

    mockSingle.mockResolvedValue({
      data: { role: UserRole.MASTER_ADMIN },
      error: null,
    });

    const updatedSettings = [createMockSetting({ key: 'site_name', value: 'Updated Name' })];
    mockExecuteUpdateMany.mockResolvedValue(Result.ok(updatedSettings));

    const { PUT } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/cms/settings', {
      method: 'PUT',
      body: {
        settings: {
          site_name: 'Updated Name',
        },
      },
    });
    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockExecuteUpdateMany).toHaveBeenCalledWith({ site_name: 'Updated Name' }, mockUser.id);
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

    mockExecuteUpdateMany.mockResolvedValue(Result.fail('Ayar bulunamadı'));

    const { PUT } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/cms/settings', {
      method: 'PUT',
      body: {
        site_name: 'Updated Name',
      },
    });
    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Ayar bulunamadı');
  });
});
