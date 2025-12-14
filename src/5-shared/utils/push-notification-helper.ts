/**
 * Push Notification Helper Utilities
 *
 * Helper functions for push notification management
 */

import { logger } from './logger';

/**
 * Update app badge count
 */
export async function updateAppBadge(count: number): Promise<void> {
  if (typeof window === 'undefined' || !('setAppBadge' in navigator)) {
    return;
  }

  try {
    if (count > 0) {
      await navigator.setAppBadge(count);
    } else {
      await navigator.clearAppBadge();
    }
  } catch (error) {
    logger.warn('Failed to update app badge', { error });
  }
}

/**
 * Clear app badge
 */
export async function clearAppBadge(): Promise<void> {
  if (typeof window === 'undefined' || !('clearAppBadge' in navigator)) {
    return;
  }

  try {
    await navigator.clearAppBadge();
  } catch (error) {
    logger.warn('Failed to clear app badge', { error });
  }
}

/**
 * Send message to service worker
 */
export async function sendMessageToServiceWorker(
  type: string,
  data?: Record<string, unknown>
): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if (registration.active) {
      registration.active.postMessage({ type, ...data });
    }
  } catch (error) {
    logger.warn('Failed to send message to service worker', { error });
  }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  try {
    return await Notification.requestPermission();
  } catch (error) {
    logger.error('Failed to request notification permission', { error });
    return 'denied';
  }
}

/**
 * Check if push notifications are supported
 */
export function isPushNotificationSupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}
