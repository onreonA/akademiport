/**
 * Unit Tests for UpdateNotificationPreferencesUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateNotificationPreferencesUseCase } from './UpdateNotificationPreferencesUseCase';
import { INotificationPreferencesRepository } from '@/3-domain/interfaces/repositories/INotificationRepository';
import { NotificationPreferences } from '@/3-domain/entities/NotificationPreferences';
import { NotificationType } from '@/3-domain/enums/NotificationEnums';
import { Result } from '@/6-core/result';

describe('UpdateNotificationPreferencesUseCase', () => {
  let mockRepository: INotificationPreferencesRepository;
  let useCase: UpdateNotificationPreferencesUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findByUserId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    useCase = new UpdateNotificationPreferencesUseCase(mockRepository);
  });

  const createMockPreferences = (
    overrides?: Partial<NotificationPreferences>
  ): NotificationPreferences => {
    return {
      id: 'pref-1',
      userId: 'user-1',
      emailEnabled: true,
      pushEnabled: true,
      inAppEnabled: true,
      typePreferences: {},
      quietHoursEnabled: false,
      quietHoursStart: undefined,
      quietHoursEnd: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  it('should update existing preferences successfully', async () => {
    const userId = 'user-1';
    const dto = {
      emailEnabled: false,
      pushEnabled: true,
    };
    const existingPreferences = createMockPreferences({ userId });
    const updatedPreferences = createMockPreferences({
      userId,
      emailEnabled: false,
      pushEnabled: true,
    });

    vi.mocked(mockRepository.findByUserId).mockResolvedValue(Result.ok(existingPreferences));
    vi.mocked(mockRepository.update).mockResolvedValue(Result.ok(updatedPreferences));

    const result = await useCase.execute(userId, dto);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(updatedPreferences);
    expect(mockRepository.findByUserId).toHaveBeenCalledWith(userId);
    expect(mockRepository.update).toHaveBeenCalledWith(userId, {
      emailEnabled: false,
      pushEnabled: true,
    });
  });

  it('should create default preferences if not exists', async () => {
    const userId = 'user-1';
    const dto = {
      emailEnabled: false,
    };
    const newPreferences = createMockPreferences({ userId, emailEnabled: false });

    vi.mocked(mockRepository.findByUserId).mockResolvedValue(Result.ok(null));
    vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(newPreferences));
    vi.mocked(mockRepository.update).mockResolvedValue(Result.ok(newPreferences));

    const result = await useCase.execute(userId, dto);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.create).toHaveBeenCalled();
    expect(mockRepository.update).toHaveBeenCalledWith(userId, {
      emailEnabled: false,
    });
  });

  it('should update type preferences', async () => {
    const userId = 'user-1';
    const dto = {
      typePreferences: {
        [NotificationType.APPOINTMENT_CONFIRMED]: { email: true, push: true, inApp: true },
        [NotificationType.TASK_ASSIGNED]: { email: false, push: false, inApp: false },
      },
    };
    const existingPreferences = createMockPreferences({
      userId,
      typePreferences: {
        [NotificationType.APPOINTMENT_CONFIRMED]: { email: false, push: false, inApp: false },
        [NotificationType.TASK_ASSIGNED]: { email: true, push: true, inApp: true },
      },
    });
    const updatedPreferences = createMockPreferences({
      userId,
      typePreferences: {
        [NotificationType.APPOINTMENT_CONFIRMED]: { email: true, push: true, inApp: true },
        [NotificationType.TASK_ASSIGNED]: { email: false, push: false, inApp: false },
      },
    });

    vi.mocked(mockRepository.findByUserId).mockResolvedValue(Result.ok(existingPreferences));
    vi.mocked(mockRepository.update).mockResolvedValue(Result.ok(updatedPreferences));

    const result = await useCase.execute(userId, dto);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.update).toHaveBeenCalledWith(userId, {
      typePreferences: {
        [NotificationType.APPOINTMENT_CONFIRMED]: { email: true, push: true, inApp: true },
        [NotificationType.TASK_ASSIGNED]: { email: false, push: false, inApp: false },
      },
    });
  });

  it('should update quiet hours', async () => {
    const userId = 'user-1';
    const dto = {
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
    };
    const existingPreferences = createMockPreferences({ userId });
    const updatedPreferences = createMockPreferences({
      userId,
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
    });

    vi.mocked(mockRepository.findByUserId).mockResolvedValue(Result.ok(existingPreferences));
    vi.mocked(mockRepository.update).mockResolvedValue(Result.ok(updatedPreferences));

    const result = await useCase.execute(userId, dto);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.update).toHaveBeenCalledWith(userId, {
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
    });
  });

  it('should handle repository findByUserId errors', async () => {
    const userId = 'user-1';
    const dto = { emailEnabled: false };
    const errorMessage = 'Database error';
    const newPreferences = createMockPreferences({ userId, emailEnabled: false });

    // Mock findByUserId to return a failure Result
    // When findByUserId fails, use case will try to create default preferences
    vi.mocked(mockRepository.findByUserId).mockResolvedValue({
      isSuccess: false,
      isFailure: true,
      error: new Error(errorMessage),
      value: undefined,
    } as any);
    vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(newPreferences));
    vi.mocked(mockRepository.update).mockResolvedValue(Result.ok(newPreferences));

    const result = await useCase.execute(userId, dto);

    // Use case will create default preferences when findByUserId fails
    expect(result.isSuccess).toBe(true);
    expect(mockRepository.create).toHaveBeenCalled();
  });

  it('should handle repository create errors when creating default preferences', async () => {
    const userId = 'user-1';
    const dto = { emailEnabled: false };
    const errorMessage = 'Create failed';

    vi.mocked(mockRepository.findByUserId).mockResolvedValue(Result.ok(null));
    vi.mocked(mockRepository.create).mockResolvedValue(Result.fail(new Error(errorMessage)));

    const result = await useCase.execute(userId, dto);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
  });

  it('should handle repository update errors', async () => {
    const userId = 'user-1';
    const dto = { emailEnabled: false };
    const existingPreferences = createMockPreferences({ userId });
    const errorMessage = 'Update failed';

    vi.mocked(mockRepository.findByUserId).mockResolvedValue(Result.ok(existingPreferences));
    vi.mocked(mockRepository.update).mockResolvedValue(Result.fail(new Error(errorMessage)));

    const result = await useCase.execute(userId, dto);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
  });

  it('should handle exceptions', async () => {
    const userId = 'user-1';
    const dto = { emailEnabled: false };
    const errorMessage = 'Unexpected error';

    // Mock findByUserId to throw an error
    vi.mocked(mockRepository.findByUserId).mockImplementation(() => {
      throw new Error(errorMessage);
    });

    const result = await useCase.execute(userId, dto);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
  });
});
