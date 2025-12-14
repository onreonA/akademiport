/**
 * usePushNotifications Hook
 *
 * Hook for managing push notification subscriptions
 */

import { useEffect, useState } from 'react';
import {
  useSubscribeToPushNotifications,
  useUnsubscribeFromPushNotifications,
} from './useNotifications';
import { notificationConfig } from '@/4-infrastructure/config/notification.config';
import { logger } from '@/5-shared/utils/logger';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const subscribeMutation = useSubscribeToPushNotifications();
  const unsubscribeMutation = useUnsubscribeFromPushNotifications();

  useEffect(() => {
    // Check if browser supports push notifications
    const supported =
      'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

    // Use setTimeout to avoid synchronous setState in effect
    const timeoutId = setTimeout(() => {
      setIsSupported(supported);
      if (supported) {
        setPermission(Notification.permission);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      logger.warn('Push notifications not supported');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      logger.error('Failed to request notification permission', { error });
      return false;
    }
  };

  const subscribe = async (): Promise<boolean> => {
    if (!isSupported) {
      logger.warn('Push notifications not supported');
      return false;
    }

    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        return false;
      }
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await registration.update();

      // Subscribe to push notifications
      const applicationServerKey = urlBase64ToUint8Array(notificationConfig.vapid.publicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource,
      });

      // Send subscription to server
      const result = await subscribeMutation.mutateAsync(subscription.toJSON() as any);
      if (result) {
        setSubscription(subscription);
        setIsSubscribed(true);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Failed to subscribe to push notifications', { error });
      return false;
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        await unsubscribeMutation.mutateAsync(subscription.endpoint);
        setIsSubscribed(false);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Failed to unsubscribe from push notifications', { error });
      return false;
    }
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    checkSubscription,
    isLoading: subscribeMutation.isPending || unsubscribeMutation.isPending,
  };
}

/**
 * Convert VAPID public key from URL-safe base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
