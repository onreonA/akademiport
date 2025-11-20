/**
 * Unit Tests for GetUnreadNotificationCountUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetUnreadNotificationCountUseCase } from './GetUnreadNotificationCountUseCase';
import { INotificationRepository } from '@/3-domain/interfaces/repositories/INotificationRepository';
import { Result } from '@/6-core/result';

describe('GetUnreadNotificationCountUseCase', () => {
  let mockRepository: INotificationRepository;
  let useCase: GetUnreadNotificationCountUseCase;

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

    useCase = new GetUnreadNotificationCountUseCase(mockRepository);
  });

  it('should get unread notification count successfully', async () => {
    const userId = 'user-1';
    const count = 5;

    vi.mocked(mockRepository.getUnreadCount).mockResolvedValue(Result.ok(count));

    const result = await useCase.execute(userId);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe(count);
    expect(mockRepository.getUnreadCount).toHaveBeenCalledWith(userId);
  });

  it('should return zero when no unread notifications', async () => {
    const userId = 'user-1';
    const count = 0;

    vi.mocked(mockRepository.getUnreadCount).mockResolvedValue(Result.ok(count));

    const result = await useCase.execute(userId);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe(0);
  });

  it('should handle repository errors', async () => {
    const userId = 'user-1';
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.getUnreadCount).mockResolvedValue(
      Result.fail(new Error(errorMessage))
    );

    const result = await useCase.execute(userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
  });

  it('should handle exceptions', async () => {
    const userId = 'user-1';
    const errorMessage = 'Unexpected error';

    vi.mocked(mockRepository.getUnreadCount).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
  });
});
