/**
 * Notification Preferences Entity Tests
 *
 * Unit tests for NotificationPreferences entity
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createDefaultNotificationPreferences,
  isNotificationEnabledForChannel,
  isQuietHours,
} from './NotificationPreferences';
import { NotificationType, NotificationChannel } from '../enums/NotificationEnums';

describe('NotificationPreferences Entity', () => {
  describe('createDefaultNotificationPreferences', () => {
    it('should create default preferences with all channels enabled', () => {
      const preferences = createDefaultNotificationPreferences('user-123');

      expect(preferences.id).toBeDefined();
      expect(preferences.userId).toBe('user-123');
      expect(preferences.emailEnabled).toBe(true);
      expect(preferences.pushEnabled).toBe(true);
      expect(preferences.inAppEnabled).toBe(true);
      expect(preferences.quietHoursEnabled).toBe(false);
      expect(preferences.typePreferences).toEqual({});
      expect(preferences.createdAt).toBeInstanceOf(Date);
      expect(preferences.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('isNotificationEnabledForChannel', () => {
    let preferences: ReturnType<typeof createDefaultNotificationPreferences>;

    beforeEach(() => {
      preferences = createDefaultNotificationPreferences('user-123');
    });

    it('should return true if channel is globally enabled', () => {
      expect(
        isNotificationEnabledForChannel(
          preferences,
          NotificationType.INFO,
          NotificationChannel.EMAIL
        )
      ).toBe(true);
      expect(
        isNotificationEnabledForChannel(
          preferences,
          NotificationType.INFO,
          NotificationChannel.PUSH
        )
      ).toBe(true);
      expect(
        isNotificationEnabledForChannel(
          preferences,
          NotificationType.INFO,
          NotificationChannel.IN_APP
        )
      ).toBe(true);
    });

    it('should return false if channel is globally disabled', () => {
      preferences.emailEnabled = false;
      expect(
        isNotificationEnabledForChannel(
          preferences,
          NotificationType.INFO,
          NotificationChannel.EMAIL
        )
      ).toBe(false);
    });

    it('should respect type-specific preferences', () => {
      preferences.typePreferences = {
        [NotificationType.TASK_ASSIGNED]: {
          email: false,
          push: true,
          inApp: true,
        },
      };

      expect(
        isNotificationEnabledForChannel(
          preferences,
          NotificationType.TASK_ASSIGNED,
          NotificationChannel.EMAIL
        )
      ).toBe(false);
      expect(
        isNotificationEnabledForChannel(
          preferences,
          NotificationType.TASK_ASSIGNED,
          NotificationChannel.PUSH
        )
      ).toBe(true);
      expect(
        isNotificationEnabledForChannel(
          preferences,
          NotificationType.TASK_ASSIGNED,
          NotificationChannel.IN_APP
        )
      ).toBe(true);
    });

    it('should respect global preference first, then type-specific', () => {
      // Global email enabled
      preferences.emailEnabled = true;
      preferences.typePreferences = {
        [NotificationType.TASK_ASSIGNED]: {
          email: false, // Type-specific can disable even if global is enabled
          push: true,
          inApp: true,
        },
      };

      // Type-specific can disable (email: false)
      expect(
        isNotificationEnabledForChannel(
          preferences,
          NotificationType.TASK_ASSIGNED,
          NotificationChannel.EMAIL
        )
      ).toBe(false);
      // Other types use global (emailEnabled = true)
      expect(
        isNotificationEnabledForChannel(
          preferences,
          NotificationType.INFO,
          NotificationChannel.EMAIL
        )
      ).toBe(true);

      // If global is disabled, type-specific cannot enable
      preferences.emailEnabled = false;
      preferences.typePreferences[NotificationType.TASK_ASSIGNED]!.email = true;
      expect(
        isNotificationEnabledForChannel(
          preferences,
          NotificationType.TASK_ASSIGNED,
          NotificationChannel.EMAIL
        )
      ).toBe(false);
    });
  });

  describe('isQuietHours', () => {
    let preferences: ReturnType<typeof createDefaultNotificationPreferences>;

    beforeEach(() => {
      preferences = createDefaultNotificationPreferences('user-123');
    });

    it('should return false if quiet hours are disabled', () => {
      preferences.quietHoursEnabled = false;
      expect(isQuietHours(preferences)).toBe(false);
    });

    it('should return false if quiet hours are not set', () => {
      preferences.quietHoursEnabled = true;
      expect(isQuietHours(preferences)).toBe(false);
    });

    it('should return true if current time is within quiet hours', () => {
      preferences.quietHoursEnabled = true;
      preferences.quietHoursStart = '22:00';
      preferences.quietHoursEnd = '08:00';

      // Mock current time to be 23:00 (within quiet hours)
      const mockDate = new Date('2025-01-15T23:00:00');
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);

      expect(isQuietHours(preferences)).toBe(true);

      vi.useRealTimers();
    });

    it('should return false if current time is outside quiet hours', () => {
      preferences.quietHoursEnabled = true;
      preferences.quietHoursStart = '22:00';
      preferences.quietHoursEnd = '08:00';

      // Mock current time to be 10:00 (outside quiet hours)
      const mockDate = new Date('2025-01-15T10:00:00');
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);

      expect(isQuietHours(preferences)).toBe(false);

      vi.useRealTimers();
    });
  });
});
