/**
 * Service Worker for PWA
 * 
 * Handles offline-first sync and caching for Fikra Valley
 */

const CACHE_NAME = 'fikra-valley-v1';
const STATIC_CACHE = 'fikra-static-v1';

// Install - Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/fikra_logo_v3.png',
        '/fikravalley_words_logo.png',
      ]);
    })
  );
  self.skipWaiting();
});

// Activate - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  event.waitUntil(self.clients.claim());
});

// Fetch - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseToCache = response.clone();

        // Cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// Background Sync - Sync Fikra Journal entries
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-fikra') {
    event.waitUntil(syncFikraData());
  }
});

async function syncFikraData() {
  try {
    const response = await fetch('/api/fikra-journal/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trigger: 'background-sync' }),
    });

    if (response.ok) {
      console.log('Background sync successful');
    }
  } catch (error) {
    console.error('Background sync failed:', error);
    // Will retry automatically
  }
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/fikra_logo_v3.png',
      badge: '/fikra_logo_v3.png',
      vibrate: [200, 100, 200],
      tag: data.tag || 'fikra-notification',
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Fikra Valley', options)
    );
  }
});
