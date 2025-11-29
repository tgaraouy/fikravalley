'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Register service worker for PWA
    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available, prompt user to refresh
                if (process.env.NODE_ENV === 'development') {
                  console.log('New service worker available. Refresh to update.');
                }
              }
            });
          }
        });

        if (process.env.NODE_ENV === 'development') {
          console.log('Service Worker registered:', registration.scope);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Service Worker registration failed:', error);
        }
      }
    };

    // Register immediately
    registerServiceWorker();

    // Also register on page load (in case user navigates)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Service worker already controlling this page
      if (process.env.NODE_ENV === 'development') {
        console.log('Service Worker already controlling page');
      }
    }
  }, []);

  return null;
}

