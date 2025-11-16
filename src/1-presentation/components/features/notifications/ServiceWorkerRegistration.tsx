/**
 * Service Worker Registration Component
 *
 * Registers service worker for push notifications
 */

'use client';

import { useEffect } from 'react';
import { logger } from '@/5-shared/utils/logger';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      let updateInterval: NodeJS.Timeout | null = null;

      // Register service worker with error handling
      navigator.serviceWorker
        .register('/sw.js', {
          scope: '/',
        })
        .then((registration) => {
          logger.info('Service Worker registered', { scope: registration.scope });

          // Check for updates periodically (only if registration is active)
          updateInterval = setInterval(() => {
            if (registration.active) {
              registration.update().catch(() => {
                // Silently fail if update check fails
              });
            }
          }, 60000); // Check every minute

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available, prompt user to refresh
                  logger.info('New service worker available');
                }
              });
            }
          });
        })
        .catch((error) => {
          // Only log error if it's not a 404 or network error or script evaluation error
          const errorMessage = error?.message || String(error);
          const shouldIgnore =
            errorMessage.includes('404') ||
            errorMessage.includes('Failed to fetch') ||
            errorMessage.includes('script evaluation failed') ||
            errorMessage.includes('ServiceWorker script evaluation failed');

          if (!shouldIgnore) {
            logger.error('Service Worker registration failed', { error });
          }
        });

      // Cleanup interval on unmount
      return () => {
        if (updateInterval) {
          clearInterval(updateInterval);
        }
      };
    }
  }, []);

  return null;
}
