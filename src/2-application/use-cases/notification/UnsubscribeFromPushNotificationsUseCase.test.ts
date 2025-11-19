/**
 * Unit Tests for UnsubscribeFromPushNotificationsUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnsubscribeFromPushNotificationsUseCase } from './UnsubscribeFromPushNotificationsUseCase';
import { IPushSubscriptionRepository } from '@/3-domain/interfaces/repositories/INotificationRepository';
import { Result } from '@/6-core/result';

describe('UnsubscribeFromPushNotificationsUseCase', () => {
  let mockRepository: IPushSubscriptionRepository;
  let useCase: UnsubscribeFromPushNotificationsUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findByEndpoint: vi.fn(),
      delete: vi.fn(),
      deleteByEndpoint: vi.fn(),
      deleteByUserId: vi.fn(),
    };

    useCase = new UnsubscribeFromPushNotificationsUseCase(mockRepository);
  });

  it('should unsubscribe from specific endpoint successfully', async () => {
    const userId = 'user-1';
    const endpoint = 'https://example.com/push';

    vi.mocked(mockRepository.deleteByEndpoint).mockResolvedValue(Result.ok(undefined));

    const result = await useCase.execute(userId, endpoint);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.deleteByEndpoint).toHaveBeenCalledWith(userId, endpoint);
    expect(mockRepository.deleteByUserId).not.toHaveBeenCalled();
  });

  it('should unsubscribe from all endpoints when endpoint not provided', async () => {
    const userId = 'user-1';

    vi.mocked(mockRepository.deleteByUserId).mockResolvedValue(Result.ok(undefined));

    const result = await useCase.execute(userId);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.deleteByUserId).toHaveBeenCalledWith(userId);
    expect(mockRepository.deleteByEndpoint).not.toHaveBeenCalled();
  });

  it('should handle deleteByEndpoint errors', async () => {
    const userId = 'user-1';
    const endpoint = 'https://example.com/push';
    const errorMessage = 'Failed to delete';

    vi.mocked(mockRepository.deleteByEndpoint).mockResolvedValue(
      Result.fail(new Error(errorMessage))
    );

    const result = await useCase.execute(userId, endpoint);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
  });

  it('should handle deleteByUserId errors', async () => {
    const userId = 'user-1';
    const errorMessage = 'Failed to delete';

    vi.mocked(mockRepository.deleteByUserId).mockResolvedValue(
      Result.fail(new Error(errorMessage))
    );

    const result = await useCase.execute(userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
  });

  it('should handle exceptions', async () => {
    const userId = 'user-1';
    const endpoint = 'https://example.com/push';
    const errorMessage = 'Unexpected error';

    vi.mocked(mockRepository.deleteByEndpoint).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(userId, endpoint);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
  });
});
