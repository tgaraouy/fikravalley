/**
 * Service Worker for Background Sync
 * 
 * Handles offline-first sync of Fikra Journal entries
 */

const CACHE_NAME = 'fikra-journal-v1';

// Install
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Sync event (background sync)
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'sync-fikra') {
    event.waitUntil(syncFikraData());
  }
});

// Sync function
async function syncFikraData() {
  try {
    // Import sync function (will be bundled)
    const response = await fetch('/api/fikra-journal/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trigger: 'background-sync' })
    });
    
    if (response.ok) {
      console.log('Background sync successful');
    }
  } catch (error) {
    console.error('Background sync failed:', error);
    // Will retry automatically
  }
}

// Fetch event (cache strategy)
self.addEventListener('fetch', (event: any) => {
  // Cache-first for static assets
  if (event.request.url.includes('/static/')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});

