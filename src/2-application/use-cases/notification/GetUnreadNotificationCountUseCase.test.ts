/**
 * Get Unread Notification Count Use Case Tests
 *
 * Unit tests for GetUnreadNotificationCountUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetUnreadNotificationCountUseCase } from './GetUnreadNotificationCountUseCase';
import { Result } from '@/6-core/result';

describe('GetUnreadNotificationCountUseCase', () => {
  let useCase: GetUnreadNotificationCountUseCase;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      getUnreadCount: vi.fn(),
    };

    useCase = new GetUnreadNotificationCountUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should get unread count successfully', async () => {
      const userId = 'user-123';
      const mockCount = 5;

      mockRepository.getUnreadCount.mockResolvedValue(Result.ok(mockCount));

      const result = await useCase.execute(userId);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(mockCount);
      expect(mockRepository.getUnreadCount).toHaveBeenCalledWith(userId);
    });

    it('should return zero if no unread notifications', async () => {
      const userId = 'user-123';

      mockRepository.getUnreadCount.mockResolvedValue(Result.ok(0));

      const result = await useCase.execute(userId);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(0);
    });

    it('should handle repository errors', async () => {
      const userId = 'user-123';

      mockRepository.getUnreadCount.mockResolvedValue(Result.fail(new Error('Database error')));

      const result = await useCase.execute(userId);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Database error');
    });
  });
});
