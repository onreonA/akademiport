/**
 * Integration Tests for /api/notifications/[id]
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';

vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock repository
const mockNotificationRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findByUserId: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  getUnreadCount: vi.fn(),
};

vi.mock('@/4-infrastructure/database/repositories/SupabaseNotificationRepository', () => ({
  SupabaseNotificationRepository: class {
    constructor() {
      return mockNotificationRepository;
    }
  },
}));

// Mock use case - route creates new instance
const mockDeleteNotificationExecute = vi.fn();

vi.mock('@/2-application/use-cases/notification/DeleteNotificationUseCase', () => ({
  DeleteNotificationUseCase: class {
    constructor() {}
    execute = mockDeleteNotificationExecute;
  },
}));

describe('DELETE /api/notifications/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/notifications/notification-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'notification-1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('deletes notification successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.COMPANY_USER });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockDeleteNotificationExecute.mockResolvedValue({
      isFailure: false,
      value: undefined,
    });

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/notifications/notification-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'notification-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDeleteNotificationExecute).toHaveBeenCalledWith('notification-1', user.id);
  });

  it('handles use case failure', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.COMPANY_USER });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockDeleteNotificationExecute.mockResolvedValue({
      isFailure: true,
      error: 'Delete failed',
    });

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/notifications/notification-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'notification-1' }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to delete notification');
  });
});
