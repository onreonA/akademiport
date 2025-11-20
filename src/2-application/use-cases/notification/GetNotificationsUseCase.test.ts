/**
 * Unit Tests for GetNotificationsUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetNotificationsUseCase } from './GetNotificationsUseCase';
import { INotificationRepository } from '@/3-domain/interfaces/repositories/INotificationRepository';
import { Notification } from '@/3-domain/entities/Notification';
import { NotificationType, NotificationPriority } from '@/3-domain/enums/NotificationEnums';
import { Result } from '@/6-core/result';

describe('GetNotificationsUseCase', () => {
  let mockRepository: INotificationRepository;
  let useCase: GetNotificationsUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      createMany: vi.fn(),
      findById: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteExpired: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      getUnreadCount: vi.fn(),
    } as any;

    useCase = new GetNotificationsUseCase(mockRepository);
  });

  const createMockNotification = (overrides?: Partial<Notification>): Notification => {
    return {
      id: 'notif-1',
      userId: 'user-1',
      type: NotificationType.INFO,
      title: 'Test Notification',
      message: 'Test Message',
      priority: NotificationPriority.NORMAL,
      channels: [],
      isRead: false,
      emailSent: false,
      pushSent: false,
      metadata: {},
      createdAt: new Date(),
      ...overrides,
    };
  };

  it('should get notifications successfully', async () => {
    const filter = {
      userId: 'user-1',
      limit: 10,
      offset: 0,
      orderBy: 'created_at' as const,
      orderDirection: 'desc' as const,
    };
    const mockNotifications = [
      createMockNotification({ id: 'notif-1' }),
      createMockNotification({ id: 'notif-2' }),
    ];

    vi.mocked(mockRepository.findMany).mockResolvedValue(Result.ok(mockNotifications));

    const result = await useCase.execute(filter);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockNotifications);
    expect(mockRepository.findMany).toHaveBeenCalledWith({
      userId: filter.userId,
      isRead: undefined,
      type: undefined,
      priority: undefined,
      limit: filter.limit,
      offset: filter.offset,
      orderBy: 'created_at',
      orderDirection: 'desc',
    });
  });

  it('should apply filters correctly', async () => {
    const filter = {
      userId: 'user-1',
      isRead: false,
      type: NotificationType.INFO,
      priority: NotificationPriority.HIGH,
      limit: 20,
      offset: 10,
      orderBy: 'created_at' as const,
      orderDirection: 'desc' as const,
    };
    const mockNotifications = [createMockNotification({ id: 'notif-1' })];

    vi.mocked(mockRepository.findMany).mockResolvedValue(Result.ok(mockNotifications));

    const result = await useCase.execute(filter);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.findMany).toHaveBeenCalledWith({
      userId: filter.userId,
      isRead: false,
      type: NotificationType.INFO,
      priority: NotificationPriority.HIGH,
      limit: 20,
      offset: 10,
      orderBy: 'created_at',
      orderDirection: 'desc',
    });
  });

  it('should handle repository errors', async () => {
    const filter = {
      userId: 'user-1',
      limit: 10,
      offset: 0,
      orderBy: 'created_at' as const,
      orderDirection: 'desc' as const,
    };
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findMany).mockResolvedValue(Result.fail(new Error(errorMessage)));

    const result = await useCase.execute(filter);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
  });

  it('should handle exceptions', async () => {
    const filter = {
      userId: 'user-1',
      limit: 10,
      offset: 0,
      orderBy: 'created_at' as const,
      orderDirection: 'desc' as const,
    };
    const errorMessage = 'Unexpected error';

    vi.mocked(mockRepository.findMany).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(filter);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
  });
});
