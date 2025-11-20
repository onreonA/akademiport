/**
 * Unit Tests for SubscribeToPushNotificationsUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SubscribeToPushNotificationsUseCase } from './SubscribeToPushNotificationsUseCase';
import { IPushSubscriptionRepository } from '@/3-domain/interfaces/repositories/INotificationRepository';
import { PushSubscription } from '@/3-domain/entities/PushSubscription';
import { Result } from '@/6-core/result';

describe('SubscribeToPushNotificationsUseCase', () => {
  let mockRepository: IPushSubscriptionRepository;
  let useCase: SubscribeToPushNotificationsUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findByUserId: vi.fn(),
      findByEndpoint: vi.fn(),
      delete: vi.fn(),
      deleteByEndpoint: vi.fn(),
      deleteByUserId: vi.fn(),
    } as any;

    useCase = new SubscribeToPushNotificationsUseCase(mockRepository);
  });

  const createMockSubscription = (overrides?: Partial<PushSubscription>): PushSubscription => {
    return {
      id: 'sub-1',
      userId: 'user-1',
      endpoint: 'https://example.com/push',
      p256dh: 'p256dh-key',
      auth: 'auth-key',
      userAgent: 'Mozilla/5.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  const createValidDto = () => ({
    endpoint: 'https://example.com/push',
    keys: {
      p256dh: 'p256dh-key',
      auth: 'auth-key',
    },
    userAgent: 'Mozilla/5.0',
  });

  it('should subscribe to push notifications successfully', async () => {
    const userId = 'user-1';
    const dto = createValidDto();
    const mockSubscription = createMockSubscription({ userId });

    vi.mocked(mockRepository.findByEndpoint).mockResolvedValue(Result.ok(null));
    vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(mockSubscription));

    const result = await useCase.execute(userId, dto);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockSubscription);
    expect(mockRepository.findByEndpoint).toHaveBeenCalledWith(userId, dto.endpoint);
    expect(mockRepository.create).toHaveBeenCalled();
  });

  it('should replace existing subscription', async () => {
    const userId = 'user-1';
    const dto = createValidDto();
    const existingSubscription = createMockSubscription({ id: 'old-sub', userId });
    const newSubscription = createMockSubscription({ id: 'new-sub', userId });

    vi.mocked(mockRepository.findByEndpoint).mockResolvedValue(Result.ok(existingSubscription));
    vi.mocked(mockRepository.delete).mockResolvedValue(Result.ok(undefined));
    vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(newSubscription));

    const result = await useCase.execute(userId, dto);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.delete).toHaveBeenCalledWith(existingSubscription.id, userId);
    expect(mockRepository.create).toHaveBeenCalled();
  });

  it('should fail when subscription data is invalid', async () => {
    const userId = 'user-1';
    // Invalid DTO - missing required fields
    const invalidDto = {
      endpoint: '', // Invalid empty endpoint
      keys: {
        p256dh: '', // Invalid empty p256dh
        auth: '', // Invalid empty auth
      },
      userAgent: '',
    };

    vi.mocked(mockRepository.findByEndpoint).mockResolvedValue(Result.ok(null));

    const result = await useCase.execute(userId, invalidDto);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Invalid push subscription data');
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const userId = 'user-1';
    const dto = createValidDto();
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findByEndpoint).mockResolvedValue(Result.ok(null));
    vi.mocked(mockRepository.create).mockResolvedValue(Result.fail(new Error(errorMessage)));

    const result = await useCase.execute(userId, dto);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
  });

  it('should handle exceptions', async () => {
    const userId = 'user-1';
    const dto = createValidDto();
    const errorMessage = 'Unexpected error';

    vi.mocked(mockRepository.findByEndpoint).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(userId, dto);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
  });
});
