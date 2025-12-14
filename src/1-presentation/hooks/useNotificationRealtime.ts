/**
 * useNotificationRealtime Hook
 *
 * Hook for real-time notification updates
 * Integrates with NotificationContext for live updates
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNotificationContext } from '@/5-shared/contexts/NotificationContext';
import { Notification } from '@/3-domain/entities/Notification';
import { logger } from '@/5-shared/utils/logger';

export interface UseNotificationRealtimeOptions {
  /**
   * Callback when a new notification is received
   */
  onNewNotification?: (notification: Notification) => void;
  /**
   * Callback when a notification is updated
   */
  onNotificationUpdate?: (notification: Notification) => void;
  /**
   * Callback when a notification is deleted
   */
  onNotificationDelete?: (notificationId: string) => void;
  /**
   * Enable browser notifications
   */
  enableBrowserNotifications?: boolean;
  /**
   * Enable sound notifications
   */
  enableSound?: boolean;
  /**
   * Sound file path for notifications
   */
  soundFile?: string;
}

/**
 * Hook to handle real-time notification updates
 */
export function useNotificationRealtime(options: UseNotificationRealtimeOptions = {}) {
  const {
    onNewNotification,
    onNotificationUpdate,
    onNotificationDelete,
    enableSound = false,
    soundFile = '/sounds/notification.mp3',
  } = options;

  const queryClient = useQueryClient();
  const { isConnected, subscribe, unsubscribe } = useNotificationContext();

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!enableSound || typeof window === 'undefined') {
      return;
    }

    try {
      const audio = new Audio(soundFile);
      audio.volume = 0.5;
      audio.play().catch((error) => {
        logger.warn('Failed to play notification sound', { error });
      });
    } catch (error) {
      logger.warn('Failed to create audio for notification sound', { error });
    }
  }, [enableSound, soundFile]);

  // Handle new notification
  const handleNewNotification = useCallback(
    (notification: Notification) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });

      // Optimistically update cache
      queryClient.setQueryData(['notifications'], (old: Notification[] | undefined) => {
        if (!old) return [notification];
        return [notification, ...old];
      });

      queryClient.setQueryData(['notifications', 'unread-count'], (old: number | undefined) => {
        return (old || 0) + 1;
      });

      // Play sound
      playNotificationSound();

      // Call custom callback
      onNewNotification?.(notification);
    },
    [queryClient, onNewNotification, playNotificationSound]
  );

  // Handle notification update
  const handleNotificationUpdate = useCallback(
    (notification: Notification) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });

      // Optimistically update cache
      queryClient.setQueryData(['notifications'], (old: Notification[] | undefined) => {
        if (!old) return old;
        return old.map((n) => (n.id === notification.id ? notification : n));
      });

      // Update unread count if notification was marked as read
      if (notification.isRead) {
        queryClient.setQueryData(['notifications', 'unread-count'], (old: number | undefined) => {
          const current = old || 0;
          return Math.max(0, current - 1);
        });
      }

      // Call custom callback
      onNotificationUpdate?.(notification);
    },
    [queryClient, onNotificationUpdate]
  );

  // Handle notification delete
  const handleNotificationDelete = useCallback(
    (notificationId: string) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });

      // Optimistically update cache
      queryClient.setQueryData(['notifications'], (old: Notification[] | undefined) => {
        if (!old) return old;
        const filtered = old.filter((n) => n.id !== notificationId);
        return filtered;
      });

      // Update unread count if deleted notification was unread
      queryClient.setQueryData(['notifications'], (old: Notification[] | undefined) => {
        if (!old) return old;
        const deleted = old.find((n) => n.id === notificationId);
        if (deleted && !deleted.isRead) {
          queryClient.setQueryData(
            ['notifications', 'unread-count'],
            (oldCount: number | undefined) => {
              const current = oldCount || 0;
              return Math.max(0, current - 1);
            }
          );
        }
        return old;
      });

      // Call custom callback
      onNotificationDelete?.(notificationId);
    },
    [queryClient, onNotificationDelete]
  );

  // Subscribe to real-time updates
  useEffect(() => {
    if (isConnected) {
      subscribe();
    }

    return () => {
      unsubscribe();
    };
  }, [isConnected, subscribe, unsubscribe]);

  return {
    isConnected,
    handleNewNotification,
    handleNotificationUpdate,
    handleNotificationDelete,
  };
}
