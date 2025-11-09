/**
 * Sentry Client Configuration
 * This file configures Sentry for the client-side of the application
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',

  // Replay can be used to record user sessions
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // If the entire session is not sampled, use the below sample rate to sample sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Set sample rate for profiling
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Filter out sensitive data
  beforeSend(event) {
    // Don't send events in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_SENTRY_ENABLE_DEV) {
      return null;
    }

    // Filter out sensitive information
    if (event.request) {
      // Remove sensitive headers
      if (event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
    }

    return event;
  },

  // Set user context
  initialScope: {
    tags: {
      environment: process.env.NODE_ENV || 'development',
    },
  },
});
