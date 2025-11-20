/**
 * Unit Tests for MarkAllNotificationsAsReadUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MarkAllNotificationsAsReadUseCase } from './MarkAllNotificationsAsReadUseCase';
import { INotificationRepository } from '@/3-domain/interfaces/repositories/INotificationRepository';
import { Result } from '@/6-core/result';

describe('MarkAllNotificationsAsReadUseCase', () => {
  let mockRepository: INotificationRepository;
  let useCase: MarkAllNotificationsAsReadUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      createMany: vi.fn(),
      findById: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      getUnreadCount: vi.fn(),
      deleteExpired: vi.fn(),
    };

    useCase = new MarkAllNotificationsAsReadUseCase(mockRepository);
  });

  it('should mark all notifications as read successfully', async () => {
    const userId = 'user-1';
    const updatedCount = 5;

    vi.mocked(mockRepository.markAllAsRead).mockResolvedValue(Result.ok(updatedCount));

    const result = await useCase.execute(userId);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe(updatedCount);
    expect(mockRepository.markAllAsRead).toHaveBeenCalledWith(userId);
  });

  it('should return zero when no notifications to mark', async () => {
    const userId = 'user-1';

    vi.mocked(mockRepository.markAllAsRead).mockResolvedValue(Result.ok(0));

    const result = await useCase.execute(userId);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe(0);
  });

  it('should handle repository errors', async () => {
    const userId = 'user-1';

    vi.mocked(mockRepository.markAllAsRead).mockResolvedValue(
      Result.fail(new Error('Database error'))
    );

    const result = await useCase.execute(userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Database error');
  });

  it('should handle exceptions', async () => {
    const userId = 'user-1';
    const errorMessage = 'Unexpected error';

    vi.mocked(mockRepository.markAllAsRead).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
  });
});
