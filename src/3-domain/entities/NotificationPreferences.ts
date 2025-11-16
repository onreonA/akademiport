/**
 * Notification Preferences Entity
 *
 * Domain entity for user notification preferences
 */

import { NotificationType, NotificationChannel } from '../enums/NotificationEnums';

export interface TypePreference {
  email?: boolean;
  push?: boolean;
  inApp?: boolean;
}

export interface NotificationPreferences {
  id: string;
  userId: string;

  // Channel preferences
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;

  // Type preferences
  typePreferences: Partial<Record<NotificationType, TypePreference>>;

  // Quiet hours
  quietHoursStart?: string; // HH:mm format
  quietHoursEnd?: string; // HH:mm format
  quietHoursEnabled: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create default notification preferences
 */
export function createDefaultNotificationPreferences(userId: string): NotificationPreferences {
  return {
    id: crypto.randomUUID(),
    userId,
    emailEnabled: true,
    pushEnabled: true,
    inAppEnabled: true,
    typePreferences: {},
    quietHoursEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Check if notification type is enabled for channel
 */
export function isNotificationEnabledForChannel(
  preferences: NotificationPreferences,
  type: NotificationType,
  channel: NotificationChannel
): boolean {
  // Check global channel preference
  switch (channel) {
    case NotificationChannel.EMAIL:
      if (!preferences.emailEnabled) return false;
      break;
    case NotificationChannel.PUSH:
      if (!preferences.pushEnabled) return false;
      break;
    case NotificationChannel.IN_APP:
      if (!preferences.inAppEnabled) return false;
      break;
    default:
      return false;
  }

  // Check type-specific preference
  const typePref = preferences.typePreferences[type];
  if (typePref) {
    switch (channel) {
      case NotificationChannel.EMAIL:
        return typePref.email !== false; // Default to true if not specified
      case NotificationChannel.PUSH:
        return typePref.push !== false;
      case NotificationChannel.IN_APP:
        return typePref.inApp !== false;
      default:
        return false;
    }
  }

  // Default to enabled if no type-specific preference
  return true;
}

/**
 * Check if current time is within quiet hours
 */
export function isQuietHours(preferences: NotificationPreferences): boolean {
  if (
    !preferences.quietHoursEnabled ||
    !preferences.quietHoursStart ||
    !preferences.quietHoursEnd
  ) {
    return false;
  }

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const start = preferences.quietHoursStart;
  const end = preferences.quietHoursEnd;

  // Handle quiet hours that span midnight
  if (start > end) {
    return currentTime >= start || currentTime <= end;
  }

  return currentTime >= start && currentTime <= end;
}
