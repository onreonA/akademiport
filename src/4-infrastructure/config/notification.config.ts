/**
 * Notification Configuration
 *
 * Configuration for notification system (Web Push API VAPID keys)
 */

export const notificationConfig = {
  /**
   * Web Push API VAPID keys
   * Generate using: npm install -g web-push && web-push generate-vapid-keys
   */
  vapid: {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || '',
    subject: process.env.VAPID_SUBJECT || 'mailto:support@akademiport.com',
  },

  /**
   * Notification settings
   */
  settings: {
    /**
     * Default expiration time for notifications (in days)
     */
    defaultExpirationDays: parseInt(process.env.NOTIFICATION_EXPIRATION_DAYS || '30', 10),

    /**
     * Maximum number of notifications per user
     */
    maxNotificationsPerUser: parseInt(process.env.MAX_NOTIFICATIONS_PER_USER || '1000', 10),

    /**
     * Batch size for bulk operations
     */
    batchSize: parseInt(process.env.NOTIFICATION_BATCH_SIZE || '100', 10),
  },
};

/**
 * Validate notification configuration
 */
export function validateNotificationConfig(): void {
  if (!notificationConfig.vapid.publicKey) {
    throw new Error('NEXT_PUBLIC_VAPID_PUBLIC_KEY is required');
  }
  if (!notificationConfig.vapid.privateKey) {
    throw new Error('VAPID_PRIVATE_KEY is required');
  }
}
