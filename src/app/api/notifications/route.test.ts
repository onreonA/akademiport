/**
 * Notifications API Route Tests
 *
 * Integration tests for GET /api/notifications and POST /api/notifications
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { Result } from '@/6-core/result';
import {
  NotificationType,
  NotificationPriority,
  NotificationChannel,
} from '@/3-domain/enums/NotificationEnums';

// Mock dependencies
const mockGetAuthenticatedUser = vi.fn();

vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: () => mockGetAuthenticatedUser(),
}));

// Mock use cases
const mockGetNotificationsUseCaseExecute = vi.fn();
const mockCreateNotificationUseCaseExecute = vi.fn();

class MockGetNotificationsUseCase {
  execute = mockGetNotificationsUseCaseExecute;
}

class MockCreateNotificationUseCase {
  execute = mockCreateNotificationUseCaseExecute;
}

vi.mock('@/2-application/use-cases/notification/GetNotificationsUseCase', () => ({
  GetNotificationsUseCase: MockGetNotificationsUseCase,
}));

vi.mock('@/2-application/use-cases/notification/CreateNotificationUseCase', () => ({
  CreateNotificationUseCase: MockCreateNotificationUseCase,
}));

// Mock repositories and services
vi.mock('@/4-infrastructure/database/repositories/SupabaseNotificationRepository', () => ({
  SupabaseNotificationRepository: vi.fn(),
}));

vi.mock(
  '@/4-infrastructure/database/repositories/SupabaseNotificationPreferencesRepository',
  () => ({
    SupabaseNotificationPreferencesRepository: vi.fn(),
  })
);

vi.mock('@/5-shared/services/email/email.service', () => ({
  EmailService: vi.fn(),
}));

vi.mock('@/5-shared/services/notification/push-notification.service', () => ({
  PushNotificationService: vi.fn(),
}));

vi.mock('@/4-infrastructure/database/repositories/SupabasePushSubscriptionRepository', () => ({
  SupabasePushSubscriptionRepository: vi.fn(),
}));

describe('GET /api/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return notifications for authenticated user', async () => {
    const { GET } = await import('./route');

    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      role: 'company_user',
    };

    mockGetAuthenticatedUser.mockResolvedValue(mockUser);

    const mockNotifications = [
      {
        id: 'notif-1',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        type: NotificationType.INFO,
        title: 'Test Notification',
        message: 'Test message',
        priority: NotificationPriority.NORMAL,
        channels: [NotificationChannel.IN_APP],
        isRead: false,
        emailSent: false,
        pushSent: false,
        metadata: {},
        createdAt: new Date(),
      },
    ];

    mockGetNotificationsUseCaseExecute.mockResolvedValue(Result.ok(mockNotifications));

    const request = new NextRequest('http://localhost:3000/api/notifications');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.notifications).toBeDefined();
    expect(Array.isArray(data.notifications)).toBe(true);
    expect(data.notifications.length).toBeGreaterThan(0);
    expect(mockGetNotificationsUseCaseExecute).toHaveBeenCalled();
  });

  it('should return 401 if user is not authenticated', async () => {
    const { GET } = await import('./route');

    mockGetAuthenticatedUser.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/notifications');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockGetNotificationsUseCaseExecute).not.toHaveBeenCalled();
  });

  it('should filter notifications by query parameters', async () => {
    const { GET } = await import('./route');

    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      role: 'company_user',
    };

    mockGetAuthenticatedUser.mockResolvedValue(mockUser);
    mockGetNotificationsUseCaseExecute.mockResolvedValue(Result.ok([]));

    const request = new NextRequest(
      'http://localhost:3000/api/notifications?isRead=false&limit=10&offset=0'
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockGetNotificationsUseCaseExecute).toHaveBeenCalled();
  });

  it('should return 500 on repository error', async () => {
    const { GET } = await import('./route');

    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      role: 'company_user',
    };

    mockGetAuthenticatedUser.mockResolvedValue(mockUser);
    mockGetNotificationsUseCaseExecute.mockResolvedValue(Result.fail(new Error('Database error')));

    const request = new NextRequest('http://localhost:3000/api/notifications');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to get notifications');
  });
});

describe('POST /api/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create notification successfully', async () => {
    const { POST } = await import('./route');

    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      role: 'admin',
    };

    mockGetAuthenticatedUser.mockResolvedValue(mockUser);

    const mockNotification = {
      id: 'notif-1',
      userId: '123e4567-e89b-12d3-a456-426614174002',
      type: NotificationType.INFO,
      title: 'New Notification',
      message: 'New message',
      priority: NotificationPriority.NORMAL,
      channels: [NotificationChannel.IN_APP],
      isRead: false,
      emailSent: false,
      pushSent: false,
      metadata: {},
      createdAt: new Date(),
    };

    mockCreateNotificationUseCaseExecute.mockResolvedValue(Result.ok(mockNotification));

    const request = new NextRequest('http://localhost:3000/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: '123e4567-e89b-12d3-a456-426614174002',
        type: NotificationType.INFO,
        title: 'New Notification',
        message: 'New message',
        priority: NotificationPriority.NORMAL,
        channels: [NotificationChannel.IN_APP],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.notification).toBeDefined();
    expect(mockCreateNotificationUseCaseExecute).toHaveBeenCalled();
  });

  it('should return 401 if user is not authenticated', async () => {
    const { POST } = await import('./route');

    mockGetAuthenticatedUser.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: '123e4567-e89b-12d3-a456-426614174002',
        type: NotificationType.INFO,
        title: 'New Notification',
        message: 'New message',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 for invalid notification data', async () => {
    const { POST } = await import('./route');

    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      role: 'admin',
    };

    mockGetAuthenticatedUser.mockResolvedValue(mockUser);

    const request = new NextRequest('http://localhost:3000/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Missing required fields
        userId: '123e4567-e89b-12d3-a456-426614174002',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid notification data');
    expect(data.details).toBeDefined();
  });

  it('should return 500 on use case error', async () => {
    const { POST } = await import('./route');

    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      role: 'admin',
    };

    mockGetAuthenticatedUser.mockResolvedValue(mockUser);
    mockCreateNotificationUseCaseExecute.mockResolvedValue(
      Result.fail(new Error('Failed to create'))
    );

    const request = new NextRequest('http://localhost:3000/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: '123e4567-e89b-12d3-a456-426614174002',
        type: NotificationType.INFO,
        title: 'New Notification',
        message: 'New message',
        priority: NotificationPriority.NORMAL,
        channels: [NotificationChannel.IN_APP],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to create notification');
  });
});
