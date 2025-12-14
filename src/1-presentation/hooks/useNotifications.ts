/**
 * useNotifications Hook
 *
 * Hook for fetching and managing notifications
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationType } from '@/3-domain/enums/NotificationEnums';
import { Notification } from '@/3-domain/entities/Notification';
import { useNotificationRealtime } from './useNotificationRealtime';

export interface UseNotificationsOptions {
  isRead?: boolean;
  type?: NotificationType;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

export interface NotificationResponse {
  notifications: Notification[];
}

export interface UnreadCountResponse {
  count: number;
}

/**
 * Hook to fetch user notifications
 */
export function useNotifications(options: UseNotificationsOptions = {}) {
  return useQuery({
    queryKey: ['notifications', options.isRead, options.type, options.limit, options.offset],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.isRead !== undefined) {
        params.append('isRead', options.isRead.toString());
      }
      if (options.type) {
        params.append('type', options.type);
      }
      if (options.limit) {
        params.append('limit', options.limit.toString());
      }
      if (options.offset) {
        params.append('offset', options.offset.toString());
      }

      const response = await fetch(`/api/notifications?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data: NotificationResponse = await response.json();
      return data.notifications;
    },
    enabled: options.enabled !== false,
  });
}

/**
 * Hook to get unread notification count with real-time updates
 */
export function useUnreadNotificationCount() {
  // Enable real-time updates
  useNotificationRealtime({
    enableBrowserNotifications: false,
    enableSound: false,
  });

  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await fetch('/api/notifications/unread-count');
      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }

      const data: UnreadCountResponse = await response.json();
      return data.count;
    },
    staleTime: 0, // Always refetch to get latest data
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to mark notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      return await response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
}

/**
 * Hook to mark all notifications as read with optimistic updates
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      const data = await response.json();
      return data.count;
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      await queryClient.cancelQueries({ queryKey: ['notifications', 'unread-count'] });

      // Snapshot previous values
      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications']);
      const previousCount = queryClient.getQueryData<number>(['notifications', 'unread-count']);

      // Optimistically update
      if (previousNotifications) {
        const now = new Date().toISOString();
        queryClient.setQueryData<Notification[]>(
          ['notifications'],
          previousNotifications.map((n) => ({ ...n, isRead: true, readAt: now }))
        );
      }

      queryClient.setQueryData<number>(['notifications', 'unread-count'], 0);

      return { previousNotifications, previousCount };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(['notifications', 'unread-count'], context.previousCount);
      }
    },
    onSuccess: () => {
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
}

/**
 * Hook to delete notification with optimistic updates
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      return await response.json();
    },
    onMutate: async (notificationId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      await queryClient.cancelQueries({ queryKey: ['notifications', 'unread-count'] });

      // Snapshot previous values
      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications']);
      const previousCount = queryClient.getQueryData<number>(['notifications', 'unread-count']);

      // Optimistically update
      if (previousNotifications) {
        const deleted = previousNotifications.find((n) => n.id === notificationId);
        queryClient.setQueryData<Notification[]>(
          ['notifications'],
          previousNotifications.filter((n) => n.id !== notificationId)
        );

        // Update unread count if deleted notification was unread
        if (deleted && !deleted.isRead && previousCount !== undefined) {
          queryClient.setQueryData<number>(
            ['notifications', 'unread-count'],
            Math.max(0, previousCount - 1)
          );
        }
      }

      return { previousNotifications, previousCount };
    },
    onError: (err, notificationId, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(['notifications', 'unread-count'], context.previousCount);
      }
    },
    onSuccess: () => {
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
}

/**
 * Hook to get notification preferences
 */
export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: async () => {
      const response = await fetch('/api/notifications/preferences');
      if (!response.ok) {
        throw new Error('Failed to fetch notification preferences');
      }

      const data = await response.json();
      return data.preferences;
    },
  });
}

/**
 * Hook to update notification preferences
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      preferences: Partial<{
        emailEnabled?: boolean;
        pushEnabled?: boolean;
        inAppEnabled?: boolean;
        typePreferences?: Record<string, { email?: boolean; push?: boolean; inApp?: boolean }>;
        quietHoursStart?: string;
        quietHoursEnd?: string;
        quietHoursEnabled?: boolean;
      }>
    ) => {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to update notification preferences');
      }

      const data = await response.json();
      return data.preferences;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] });
    },
  });
}

/**
 * Hook to subscribe to push notifications
 */
export function useSubscribeToPushNotifications() {
  return useMutation({
    mutationFn: async (subscription: PushSubscriptionJSON) => {
      const response = await fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys?.p256dh,
            auth: subscription.keys?.auth,
          },
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe to push notifications');
      }

      return await response.json();
    },
  });
}

/**
 * Hook to unsubscribe from push notifications
 */
export function useUnsubscribeFromPushNotifications() {
  return useMutation({
    mutationFn: async (endpoint?: string) => {
      const url = endpoint
        ? `/api/notifications/push/unsubscribe?endpoint=${encodeURIComponent(endpoint)}`
        : '/api/notifications/push/unsubscribe';

      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to unsubscribe from push notifications');
      }

      return await response.json();
    },
  });
}
