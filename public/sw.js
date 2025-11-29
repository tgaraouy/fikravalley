/**
 * Service Worker for PWA
 * 
 * Handles offline-first sync and caching for Fikra Valley
 */

const CACHE_NAME = 'fikra-valley-v2';
const STATIC_CACHE = 'fikra-static-v2';
const RUNTIME_CACHE = 'fikra-runtime-v2';

// Install - Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.webmanifest',
        '/png/FikraValley_flag_logo.png',
        '/favicon.ico',
      ]).catch((err) => {
        console.error('Cache addAll failed:', err);
      });
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
          .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE && name !== RUNTIME_CACHE)
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

  // Skip API requests (they should always be fresh)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseToCache = response.clone();

        // Cache successful responses (HTML, CSS, JS, images)
        if (response.status === 200) {
          const contentType = response.headers.get('content-type');
          if (
            contentType &&
            (contentType.includes('text/html') ||
              contentType.includes('text/css') ||
              contentType.includes('application/javascript') ||
              contentType.includes('image/'))
          ) {
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
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
            return caches.match('/').then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return a basic offline response
              return new Response(
                `
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>Hors ligne - Fikra Valley</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                  </head>
                  <body style="font-family: system-ui; text-align: center; padding: 2rem;">
                    <h1>Vous êtes hors ligne</h1>
                    <p>Vérifiez votre connexion internet et réessayez.</p>
                  </body>
                </html>
              `,
                {
                  headers: { 'Content-Type': 'text/html' },
                }
              );
            });
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
      icon: '/png/FikraValley_flag_logo.png',
      badge: '/png/FikraValley_flag_logo.png',
      vibrate: [200, 100, 200],
      tag: data.tag || 'fikra-notification',
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Fikra Valley', options)
    );
  }
});
