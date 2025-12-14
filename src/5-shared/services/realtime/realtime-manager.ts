/**
 * Realtime Manager
 *
 * Centralized real-time connection management with reconnection logic,
 * connection pooling, and error handling
 */

import { createBrowserClient } from '@supabase/ssr';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { logger } from '@/5-shared/utils/logger';

export interface RealtimeConfig {
  /**
   * Reconnection delay in milliseconds
   * Default: 1000ms
   */
  reconnectDelay?: number;

  /**
   * Maximum reconnection attempts
   * Default: 5
   */
  maxReconnectAttempts?: number;

  /**
   * Connection timeout in milliseconds
   * Default: 10000ms (10 seconds)
   */
  connectionTimeout?: number;

  /**
   * Enable heartbeat to keep connection alive
   * Default: true
   */
  enableHeartbeat?: boolean;

  /**
   * Heartbeat interval in milliseconds
   * Default: 30000ms (30 seconds)
   */
  heartbeatInterval?: number;
}

const defaultConfig: Required<RealtimeConfig> = {
  reconnectDelay: 1000,
  maxReconnectAttempts: 5,
  connectionTimeout: 10000,
  enableHeartbeat: true,
  heartbeatInterval: 30000,
};

export interface ChannelSubscription {
  channel: RealtimeChannel;
  channelName: string;
  subscribed: boolean;
  lastError?: Error;
  reconnectAttempts: number;
}

export class RealtimeManager {
  private supabase: ReturnType<typeof createBrowserClient>;
  private channels: Map<string, ChannelSubscription> = new Map();
  private config: Required<RealtimeConfig>;
  private heartbeatInterval?: NodeJS.Timeout;
  private isConnected: boolean = false;
  private connectionListeners: Set<(connected: boolean) => void> = new Set();

  constructor(config: RealtimeConfig = {}) {
    this.config = { ...defaultConfig, ...config };

    // Only create client in browser environment
    if (typeof window !== 'undefined') {
      this.supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      this.setupHeartbeat();
      this.setupConnectionMonitoring();
    } else {
      // Create a dummy client for SSR
      this.supabase = {} as any;
    }
  }

  /**
   * Subscribe to a channel
   */
  async subscribe(
    channelName: string,
    handlers: {
      onInsert?: (payload: any) => void;
      onUpdate?: (payload: any) => void;
      onDelete?: (payload: any) => void;
      onError?: (error: Error) => void;
    },
    filter?: { table: string; event: 'INSERT' | 'UPDATE' | 'DELETE'; filter?: string }
  ): Promise<RealtimeChannel | null> {
    // Skip in SSR
    if (typeof window === 'undefined' || !this.supabase.channel) {
      return null;
    }

    try {
      // Check if already subscribed
      const existing = this.channels.get(channelName);
      if (existing && existing.subscribed) {
        logger.debug('Channel already subscribed', { channelName });
        return existing.channel;
      }

      // Remove existing channel if present
      if (existing) {
        await this.unsubscribe(channelName);
      }

      // Create new channel
      let channel = this.supabase.channel(channelName);

      // Add event handlers if filter provided
      if (filter) {
        channel = channel.on(
          'postgres_changes',
          {
            event: filter.event,
            schema: 'public',
            table: filter.table,
            ...(filter.filter && { filter: filter.filter }),
          },
          (payload) => {
            if (filter.event === 'INSERT' && handlers.onInsert) {
              handlers.onInsert(payload);
            } else if (filter.event === 'UPDATE' && handlers.onUpdate) {
              handlers.onUpdate(payload);
            } else if (filter.event === 'DELETE' && handlers.onDelete) {
              handlers.onDelete(payload);
            }
          }
        );
      }

      // Subscribe with timeout
      const subscriptionPromise = new Promise<RealtimeChannel>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`Channel subscription timeout: ${channelName}`));
        }, this.config.connectionTimeout);

        channel.subscribe((status) => {
          clearTimeout(timeout);

          if (status === 'SUBSCRIBED') {
            logger.info('Channel subscribed', { channelName, status });
            resolve(channel);
          } else if (status === 'CHANNEL_ERROR') {
            const error = new Error(`Channel error: ${channelName}`);
            reject(error);
            if (handlers.onError) {
              handlers.onError(error);
            }
          } else if (status === 'TIMED_OUT' || status === 'CLOSED') {
            const error = new Error(`Channel ${status.toLowerCase()}: ${channelName}`);
            reject(error);
          }
        });
      });

      const subscribedChannel = await subscriptionPromise;

      // Store channel subscription
      this.channels.set(channelName, {
        channel: subscribedChannel,
        channelName,
        subscribed: true,
        reconnectAttempts: 0,
      });

      this.updateConnectionStatus(true);

      return subscribedChannel;
    } catch (error) {
      logger.error('Failed to subscribe to channel', { error, channelName });
      const err = error instanceof Error ? error : new Error(String(error));

      // Store failed subscription for reconnection
      this.channels.set(channelName, {
        channel: this.supabase.channel(channelName),
        channelName,
        subscribed: false,
        lastError: err,
        reconnectAttempts: 0,
      });

      // Attempt reconnection
      this.attemptReconnect(channelName, handlers, filter);

      if (handlers.onError) {
        handlers.onError(err);
      }

      return null;
    }
  }

  /**
   * Unsubscribe from a channel
   */
  async unsubscribe(channelName: string): Promise<void> {
    const subscription = this.channels.get(channelName);
    if (!subscription) {
      return;
    }

    // Skip in SSR
    if (typeof window === 'undefined' || !this.supabase.removeChannel) {
      this.channels.delete(channelName);
      return;
    }

    try {
      await this.supabase.removeChannel(subscription.channel);
      this.channels.delete(channelName);
      logger.info('Channel unsubscribed', { channelName });
    } catch (error) {
      logger.error('Failed to unsubscribe from channel', { error, channelName });
      // Still remove from map even if removal fails
      this.channels.delete(channelName);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  async unsubscribeAll(): Promise<void> {
    const channelNames = Array.from(this.channels.keys());
    await Promise.all(channelNames.map((name) => this.unsubscribe(name)));
  }

  /**
   * Attempt to reconnect to a channel
   */
  private async attemptReconnect(
    channelName: string,
    handlers: {
      onInsert?: (payload: any) => void;
      onUpdate?: (payload: any) => void;
      onDelete?: (payload: any) => void;
      onError?: (error: Error) => void;
    },
    filter?: { table: string; event: 'INSERT' | 'UPDATE' | 'DELETE'; filter?: string }
  ): Promise<void> {
    const subscription = this.channels.get(channelName);
    if (!subscription) {
      return;
    }

    if (subscription.reconnectAttempts >= this.config.maxReconnectAttempts) {
      logger.error('Max reconnection attempts reached', { channelName });
      return;
    }

    subscription.reconnectAttempts += 1;

    logger.info('Attempting to reconnect', {
      channelName,
      attempt: subscription.reconnectAttempts,
      maxAttempts: this.config.maxReconnectAttempts,
    });

    // Wait before reconnecting
    await new Promise((resolve) => setTimeout(resolve, this.config.reconnectDelay));

    // Retry subscription
    try {
      await this.subscribe(channelName, handlers, filter);
      subscription.reconnectAttempts = 0; // Reset on success
    } catch (error) {
      logger.error('Reconnection failed', { error, channelName });
      // Will retry again on next attempt
    }
  }

  /**
   * Setup heartbeat to keep connection alive
   */
  private setupHeartbeat(): void {
    if (!this.config.enableHeartbeat) {
      return;
    }

    this.heartbeatInterval = setInterval(() => {
      // Check connection status
      const hasActiveChannels = Array.from(this.channels.values()).some((sub) => sub.subscribed);
      this.updateConnectionStatus(hasActiveChannels);
    }, this.config.heartbeatInterval);
  }

  /**
   * Setup connection monitoring
   */
  private setupConnectionMonitoring(): void {
    // Monitor Supabase connection status
    if (this.supabase.realtime?.setChannels) {
      this.supabase.realtime.setChannels((channels) => {
        const activeChannels = channels.filter((ch) => ch.state === 'joined');
        this.updateConnectionStatus(activeChannels.length > 0);
      });
    }
  }

  /**
   * Update connection status and notify listeners
   */
  private updateConnectionStatus(connected: boolean): void {
    if (this.isConnected !== connected) {
      this.isConnected = connected;
      this.connectionListeners.forEach((listener) => listener(connected));
    }
  }

  /**
   * Add connection status listener
   */
  onConnectionChange(listener: (connected: boolean) => void): () => void {
    this.connectionListeners.add(listener);
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get all active channels
   */
  getActiveChannels(): string[] {
    return Array.from(this.channels.values())
      .filter((sub) => sub.subscribed)
      .map((sub) => sub.channelName);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.unsubscribeAll();
    this.connectionListeners.clear();
  }
}

/**
 * Global realtime manager instance
 */
let realtimeManagerInstance: RealtimeManager | null = null;

export function getRealtimeManager(config?: RealtimeConfig): RealtimeManager {
  if (!realtimeManagerInstance) {
    realtimeManagerInstance = new RealtimeManager(config);
  }
  return realtimeManagerInstance;
}
