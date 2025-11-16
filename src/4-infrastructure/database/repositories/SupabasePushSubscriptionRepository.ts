/**
 * Supabase Push Subscription Repository
 *
 * Implementation of IPushSubscriptionRepository using Supabase
 */

import { Result } from '@/6-core/result';
import { PushSubscription } from '@/3-domain/entities/PushSubscription';
import { IPushSubscriptionRepository } from '@/3-domain/interfaces/repositories/INotificationRepository';
import { getSupabaseAdminClient } from '@/4-infrastructure/database/supabase-server';
import { logger } from '@/5-shared/utils/logger';

export class SupabasePushSubscriptionRepository implements IPushSubscriptionRepository {
  async create(subscription: PushSubscription): Promise<Result<PushSubscription>> {
    try {
      const supabase = await getSupabaseAdminClient();

      const { data, error } = await supabase
        .from('push_subscriptions')
        .insert({
          id: subscription.id,
          user_id: subscription.userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.p256dh,
          auth: subscription.auth,
          user_agent: subscription.userAgent,
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create push subscription', { error, subscription });
        return Result.fail(new Error(`Failed to create push subscription: ${error.message}`));
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      logger.error('SupabasePushSubscriptionRepository.create failed', { error, subscription });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to create push subscription')
      );
    }
  }

  async findByUserId(userId: string): Promise<Result<PushSubscription[]>> {
    try {
      const supabase = await getSupabaseAdminClient();

      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        logger.error('Failed to find push subscriptions', { error, userId });
        return Result.fail(new Error(`Failed to find push subscriptions: ${error.message}`));
      }

      return Result.ok(data.map((d) => this.mapToEntity(d)));
    } catch (error) {
      logger.error('SupabasePushSubscriptionRepository.findByUserId failed', { error, userId });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to find push subscriptions')
      );
    }
  }

  async findByEndpoint(userId: string, endpoint: string): Promise<Result<PushSubscription | null>> {
    try {
      const supabase = await getSupabaseAdminClient();

      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('endpoint', endpoint)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return Result.ok(null);
        }
        logger.error('Failed to find push subscription', { error, userId, endpoint });
        return Result.fail(new Error(`Failed to find push subscription: ${error.message}`));
      }

      return Result.ok(data ? this.mapToEntity(data) : null);
    } catch (error) {
      logger.error('SupabasePushSubscriptionRepository.findByEndpoint failed', {
        error,
        userId,
        endpoint,
      });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to find push subscription')
      );
    }
  }

  async delete(id: string, userId: string): Promise<Result<void>> {
    try {
      const supabase = await getSupabaseAdminClient();

      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        logger.error('Failed to delete push subscription', { error, id, userId });
        return Result.fail(new Error(`Failed to delete push subscription: ${error.message}`));
      }

      return Result.ok(undefined);
    } catch (error) {
      logger.error('SupabasePushSubscriptionRepository.delete failed', { error, id, userId });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to delete push subscription')
      );
    }
  }

  async deleteByEndpoint(userId: string, endpoint: string): Promise<Result<void>> {
    try {
      const supabase = await getSupabaseAdminClient();

      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId)
        .eq('endpoint', endpoint);

      if (error) {
        logger.error('Failed to delete push subscription by endpoint', { error, userId, endpoint });
        return Result.fail(new Error(`Failed to delete push subscription: ${error.message}`));
      }

      return Result.ok(undefined);
    } catch (error) {
      logger.error('SupabasePushSubscriptionRepository.deleteByEndpoint failed', {
        error,
        userId,
        endpoint,
      });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to delete push subscription')
      );
    }
  }

  async deleteByUserId(userId: string): Promise<Result<number>> {
    try {
      const supabase = await getSupabaseAdminClient();

      const { data, error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId)
        .select();

      if (error) {
        logger.error('Failed to delete push subscriptions by user', { error, userId });
        return Result.fail(new Error(`Failed to delete push subscriptions: ${error.message}`));
      }

      return Result.ok(data?.length || 0);
    } catch (error) {
      logger.error('SupabasePushSubscriptionRepository.deleteByUserId failed', { error, userId });
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to delete push subscriptions')
      );
    }
  }

  private mapToEntity(data: any): PushSubscription {
    return {
      id: data.id,
      userId: data.user_id,
      endpoint: data.endpoint,
      p256dh: data.p256dh,
      auth: data.auth,
      userAgent: data.user_agent,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
