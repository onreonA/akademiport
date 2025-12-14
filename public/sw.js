/**
 * Service Worker for Push Notifications
 *
 * Handles push notifications and background sync
 */

const CACHE_NAME = 'akademi-port-v1';
// VAPID_PUBLIC_KEY will be set via message from main thread if needed
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let VAPID_PUBLIC_KEY = '';

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(['/']);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received', event);

  let notificationData = {
    title: 'Yeni Bildirim',
    body: 'Yeni bir bildiriminiz var',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'notification',
    data: {
      url: '/',
      notificationId: null,
      type: null,
    },
    requireInteraction: false,
    priority: 'normal',
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || data.message || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || data.notificationId || notificationData.tag,
        data: {
          url: data.url || data.actionUrl || notificationData.data.url,
          notificationId: data.notificationId || null,
          type: data.type || null,
          priority: data.priority || 'normal',
        },
        requireInteraction: data.priority === 'urgent' || data.requireInteraction || false,
        priority: data.priority === 'urgent' ? 'high' : 'normal',
      };
    } catch (error) {
      console.error('[Service Worker] Failed to parse push data', error);
    }
  }

  const notificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    data: notificationData.data,
    requireInteraction: notificationData.requireInteraction,
    vibrate:
      notificationData.data.priority === 'urgent' ? [200, 100, 200, 100, 200] : [200, 100, 200],
    actions: [
      {
        action: 'open',
        title: 'Aç',
        icon: '/icon-192x192.png',
      },
      {
        action: 'close',
        title: 'Kapat',
      },
    ],
    silent: false,
    timestamp: Date.now(),
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(notificationData.title, notificationOptions),
      // Update badge count if supported
      updateBadgeCount(1),
    ])
  );
});

/**
 * Update badge count (if supported)
 */
async function updateBadgeCount(increment = 0) {
  if ('setAppBadge' in navigator) {
    try {
      const currentBadge = (await navigator.getAppBadge?.()) || 0;
      await navigator.setAppBadge(currentBadge + increment);
    } catch (error) {
      console.warn('[Service Worker] Failed to update badge', error);
    }
  }
}

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';
  const notificationId = event.notification.data?.notificationId;

  event.waitUntil(
    Promise.all([
      // Mark notification as read if notificationId is provided
      notificationId
        ? fetch(`/api/notifications/${notificationId}/read`, {
            method: 'PATCH',
            credentials: 'include',
          }).catch((error) => {
            console.warn('[Service Worker] Failed to mark notification as read', error);
          })
        : Promise.resolve(),
      // Update badge count
      updateBadgeCount(-1),
      // Handle window/tab focus or open
      clients
        .matchAll({
          type: 'window',
          includeUncontrolled: true,
        })
        .then((clientList) => {
          // Check if there's already a window/tab open
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            // Focus existing window/tab
            if ('focus' in client) {
              return client.focus().then(() => {
                // Navigate to URL if different
                if (client.url !== urlToOpen && 'navigate' in client) {
                  return client.navigate(urlToOpen);
                }
                return client;
              });
            }
          }
          // If not, open a new window/tab
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        }),
    ])
  );
});

/**
 * Update badge count (if supported)
 */
async function updateBadgeCount(increment = 0) {
  if ('setAppBadge' in navigator) {
    try {
      const currentBadge = (await navigator.getAppBadge?.()) || 0;
      const newBadge = Math.max(0, currentBadge + increment);
      await navigator.setAppBadge(newBadge);
    } catch (error) {
      console.warn('[Service Worker] Failed to update badge', error);
    }
  }
}

// Background sync event (optional - for offline support)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync', event);
  // Implement background sync logic if needed
});

// Message event - handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received', event);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'UPDATE_BADGE') {
    updateBadgeCount(event.data.count || 0);
  }

  if (event.data && event.data.type === 'CLEAR_BADGE') {
    if ('clearAppBadge' in navigator) {
      navigator.clearAppBadge().catch((error) => {
        console.warn('[Service Worker] Failed to clear badge', error);
      });
    }
  }
});
