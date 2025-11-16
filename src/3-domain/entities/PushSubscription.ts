/**
 * Push Subscription Entity
 *
 * Domain entity for Web Push API subscriptions
 */

export interface PushSubscription {
  id: string;
  userId: string;

  // Web Push subscription data
  endpoint: string;
  p256dh: string; // Public key
  auth: string; // Auth secret

  // Metadata
  userAgent?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a new push subscription entity
 */
export function createPushSubscription(
  data: Omit<PushSubscription, 'id' | 'createdAt' | 'updatedAt'>
): PushSubscription {
  return {
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Validate push subscription data
 */
export function validatePushSubscription(subscription: Partial<PushSubscription>): boolean {
  return !!(
    subscription.endpoint &&
    subscription.p256dh &&
    subscription.auth &&
    subscription.userId
  );
}
