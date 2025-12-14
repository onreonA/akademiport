/**
 * Notification Context
 *
 * Context for real-time notification updates using Supabase Realtime
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Notification } from '@/3-domain/entities/Notification';
import { logger } from '@/5-shared/utils/logger';
import { getRealtimeManager } from '@/5-shared/services/realtime/realtime-manager';

interface NotificationContextType {
  isConnected: boolean;
  subscribe: () => void;
  unsubscribe: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();
  const realtimeManager = getRealtimeManager({
    reconnectDelay: 1000,
    maxReconnectAttempts: 5,
    connectionTimeout: 10000,
    enableHeartbeat: true,
    heartbeatInterval: 30000,
  });

  const subscribe = useCallback(async () => {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        return;
      }

      // Get current user (we need to use Supabase client for auth)
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return;
      }

      const channelName = `notifications:${user.id}`;

      // Subscribe to INSERT events
      await realtimeManager.subscribe(
        `${channelName}:insert`,
        {
          onInsert: (payload) => {
            logger.info('New notification received', { payload });
            const notification = payload.new as any;

            // Invalidate queries to refetch notifications
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });

            // Optimistically update cache
            queryClient.setQueryData(['notifications'], (old: any[] | undefined) => {
              if (!old) return [notification];
              return [notification, ...old];
            });

            queryClient.setQueryData(
              ['notifications', 'unread-count'],
              (old: number | undefined) => {
                return (old || 0) + 1;
              }
            );

            // Show browser notification if permission granted
            if ('Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(notification.title, {
                  body: notification.message,
                  icon: '/icon-192x192.png',
                  badge: '/badge-72x72.png',
                  tag: notification.id,
                  data: {
                    url: notification.action_url || '/',
                    notificationId: notification.id,
                  },
                });
              } catch (error) {
                logger.warn('Failed to show browser notification', { error });
              }
            }
          },
          onError: (error) => {
            logger.error('Notification channel error', { error });
          },
        },
        {
          table: 'notifications',
          event: 'INSERT',
          filter: `user_id=eq.${user.id}`,
        }
      );

      // Subscribe to UPDATE events
      await realtimeManager.subscribe(
        `${channelName}:update`,
        {
          onUpdate: (payload) => {
            logger.info('Notification updated', { payload });
            const notification = payload.new as any;

            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });

            // Optimistically update cache
            queryClient.setQueryData(['notifications'], (old: any[] | undefined) => {
              if (!old) return old;
              return old.map((n) => (n.id === notification.id ? notification : n));
            });

            // Update unread count if notification was marked as read
            if (notification.is_read) {
              queryClient.setQueryData(
                ['notifications', 'unread-count'],
                (old: number | undefined) => {
                  const current = old || 0;
                  return Math.max(0, current - 1);
                }
              );
            }
          },
        },
        {
          table: 'notifications',
          event: 'UPDATE',
          filter: `user_id=eq.${user.id}`,
        }
      );

      // Subscribe to DELETE events
      await realtimeManager.subscribe(
        `${channelName}:delete`,
        {
          onDelete: (payload) => {
            logger.info('Notification deleted', { payload });
            const deletedNotification = payload.old as any;

            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });

            // Optimistically update cache
            queryClient.setQueryData(['notifications'], (old: any[] | undefined) => {
              if (!old) return old;
              return old.filter((n) => n.id !== deletedNotification.id);
            });

            // Update unread count if deleted notification was unread
            if (deletedNotification && !deletedNotification.is_read) {
              queryClient.setQueryData(
                ['notifications', 'unread-count'],
                (old: number | undefined) => {
                  const current = old || 0;
                  return Math.max(0, current - 1);
                }
              );
            }
          },
        },
        {
          table: 'notifications',
          event: 'DELETE',
          filter: `user_id=eq.${user.id}`,
        }
      );
    } catch (error) {
      logger.error('Failed to subscribe to notifications', { error });
      setIsConnected(false);
    }
  }, [queryClient, realtimeManager]);

  const unsubscribe = useCallback(async () => {
    try {
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const channelName = `notifications:${user.id}`;
        await realtimeManager.unsubscribe(`${channelName}:insert`);
        await realtimeManager.unsubscribe(`${channelName}:update`);
        await realtimeManager.unsubscribe(`${channelName}:delete`);
      }
    } catch (error) {
      logger.error('Failed to unsubscribe from notifications', { error });
    }
  }, [realtimeManager]);

  // Subscribe on mount and monitor connection status
  useEffect(() => {
    let mounted = true;

    const initSubscription = async () => {
      if (mounted) {
        try {
          await subscribe();
        } catch (error) {
          logger.error('Notification subscription failed', { error });
        }
      }
    };

    // Monitor connection status
    const unsubscribeConnection = realtimeManager.onConnectionChange((connected) => {
      if (mounted) {
        setIsConnected(connected);
      }
    });

    // Set initial connection status
    setIsConnected(realtimeManager.getConnectionStatus());

    // Delay subscription to avoid blocking initial render
    const timeoutId = setTimeout(() => {
      initSubscription();
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      unsubscribe();
      unsubscribeConnection();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return (
    <NotificationContext.Provider value={{ isConnected, subscribe, unsubscribe }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
}
