/**
 * Notification Context
 *
 * Context for real-time notification updates using Supabase Realtime
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import type { Notification } from '@/3-domain/entities/Notification';
import { logger } from '@/5-shared/utils/logger';

interface NotificationContextType {
  isConnected: boolean;
  subscribe: () => void;
  unsubscribe: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<any>(null);
  const queryClient = useQueryClient();

  const subscribe = useCallback(async () => {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        return;
      }

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

      // Unsubscribe from existing channel if any (using ref to avoid dependency)
      setChannel((currentChannel: RealtimeChannel | null) => {
        if (currentChannel) {
          supabase.removeChannel(currentChannel).catch(() => {
            // Silently fail
          });
        }
        return null;
      });

      // Create new channel for user's notifications
      const newChannel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            logger.info('New notification received', { payload });
            // Invalidate queries to refetch notifications
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });

            // Show browser notification if permission granted
            if ('Notification' in window && Notification.permission === 'granted') {
              const notification = payload.new as any;
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
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            logger.info('Notification updated', { payload });
            // Invalidate queries to refetch notifications
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            logger.info('Notification deleted', { payload });
            // Invalidate queries to refetch notifications
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
          }
        )
        .subscribe((status) => {
          // Only log important status changes
          if (status === 'SUBSCRIBED') {
            logger.info('Notification channel subscribed', { status });
            setIsConnected(true);
          } else if (status === 'CHANNEL_ERROR') {
            logger.error('Notification channel error', { status });
            setIsConnected(false);
          } else if (status === 'TIMED_OUT' || status === 'CLOSED') {
            setIsConnected(false);
          }
        });

      setChannel(newChannel);
    } catch (error) {
      // Silently fail - don't block rendering
      setIsConnected(false);
    }
  }, [queryClient]); // Removed channel from dependencies to prevent infinite loop

  const unsubscribe = useCallback(async () => {
    if (channel) {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        await supabase.removeChannel(channel);
        setChannel(null);
        setIsConnected(false);
      } catch (error) {
        logger.error('Failed to unsubscribe from notifications', { error });
      }
    }
  }, [channel]);

  // Subscribe on mount and when user changes
  useEffect(() => {
    let mounted = true;

    const initSubscription = async () => {
      if (mounted) {
        try {
          await subscribe();
        } catch (error) {
          // Silently fail - don't block rendering
          console.error('Notification subscription failed:', error);
        }
      }
    };

    // Delay subscription to avoid blocking initial render
    const timeoutId = setTimeout(() => {
      initSubscription();
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      unsubscribe();
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
