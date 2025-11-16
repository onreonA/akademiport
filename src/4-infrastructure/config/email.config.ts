/**
 * Email Configuration
 *
 * SendGrid ve email sistemi için konfigürasyon
 */

export const emailConfig = {
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@akademiport.com',
    fromName: process.env.SENDGRID_FROM_NAME || 'Akademi Port',
    replyTo: process.env.SENDGRID_REPLY_TO || 'info@akademiport.com',
  },
  queue: {
    batchSize: parseInt(process.env.EMAIL_QUEUE_BATCH_SIZE || '10', 10),
    retryDelay: parseInt(process.env.EMAIL_RETRY_DELAY || '300000', 10), // 5 dakika
    maxRetries: parseInt(process.env.EMAIL_MAX_RETRIES || '3', 10),
  },
  tracking: {
    enabled: process.env.EMAIL_TRACKING_ENABLED !== 'false',
    openTracking: process.env.EMAIL_OPEN_TRACKING !== 'false',
    clickTracking: process.env.EMAIL_CLICK_TRACKING !== 'false',
  },
  unsubscribe: {
    baseUrl: process.env.APP_URL || 'https://akademiport.com',
    path: '/api/email/unsubscribe',
  },
} as const;

/**
 * Validate email configuration
 */
export function validateEmailConfig(): void {
  if (!emailConfig.sendgrid.apiKey) {
    throw new Error('SENDGRID_API_KEY is not set');
  }
  if (!emailConfig.sendgrid.fromEmail) {
    throw new Error('SENDGRID_FROM_EMAIL is not set');
  }
}
