/**
 * Sentry Utilities
 * Helper functions for Sentry error tracking
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Set user context for Sentry
 */
export function setSentryUser(user: {
  id: string;
  email?: string;
  username?: string;
  role?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  });
}

/**
 * Clear user context
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addSentryBreadcrumb(
  message: string,
  category?: string,
  level?: 'debug' | 'info' | 'warning' | 'error' | 'fatal'
) {
  Sentry.addBreadcrumb({
    message,
    category: category || 'custom',
    level: level || 'info',
    timestamp: Date.now() / 1000,
  });
}

/**
 * Capture exception with context
 */
export function captureException(
  error: Error,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
  }
) {
  Sentry.captureException(error, {
    tags: context?.tags,
    extra: context?.extra,
  });
}

/**
 * Capture message
 */
export function captureMessage(
  message: string,
  level: 'debug' | 'info' | 'warning' | 'error' | 'fatal' = 'info'
) {
  Sentry.captureMessage(message, level);
}
