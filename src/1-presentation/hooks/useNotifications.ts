/**
 * useNotifications Hook
 *
 * Hook for fetching and managing notifications
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationFilterDto } from '@/2-application/dtos/notification/NotificationFilterDto';
import { NotificationType } from '@/3-domain/enums/NotificationEnums';
import { logger } from '@/5-shared/utils/logger';

export interface UseNotificationsOptions {
  isRead?: boolean;
  type?: NotificationType;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

export interface NotificationResponse {
  notifications: Array<{
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
    metadata: Record<string, unknown>;
    priority: string;
    isRead: boolean;
    readAt?: string;
    channels: string[];
    emailSent: boolean;
    pushSent: boolean;
    createdAt: string;
    expiresAt?: string;
  }>;
}

export interface UnreadCountResponse {
  count: number;
}

/**
 * Hook to fetch user notifications
 */
export function useNotifications(options: UseNotificationsOptions = {}) {
  const queryClient = useQueryClient();

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
 * Hook to get unread notification count
 */
export function useUnreadNotificationCount() {
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
    refetchInterval: 30000, // Refetch every 30 seconds
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
 * Hook to mark all notifications as read
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
}

/**
 * Hook to delete notification
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
    onSuccess: () => {
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
