// Custom Worker for TGATB Habit Tracker
// This extends Workbox with our custom functionality

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Filter out files that might not exist (like app-build-manifest.json)
const manifest = self.__WB_MANIFEST.filter(entry => {
  if (typeof entry === 'string') {
    return !entry.includes('app-build-manifest.json');
  }
  return !entry.url.includes('app-build-manifest.json');
});

// Allow workbox to handle precaching with filtered manifest
precacheAndRoute(manifest);
cleanupOutdatedCaches();

// Runtime caching strategies
// Google Fonts
registerRoute(
  /^https:\/\/fonts\.googleapis\.com\/.*/i,
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 4,
        maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
      })
    ]
  })
);

registerRoute(
  /^https:\/\/fonts\.gstatic\.com\/.*/i,
  new CacheFirst({
    cacheName: 'google-fonts-static',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 4,
        maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
      })
    ]
  })
);

// Static Assets
registerRoute(
  /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
  new StaleWhileRevalidate({
    cacheName: 'static-image-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 64,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      })
    ]
  })
);

// Note: API routes removed for static export - app uses client-side storage

// Cache HTML pages with Network First strategy and proper fallback
registerRoute(
  ({ request }) => request.destination === 'document',
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      }),
      {
        // Custom fallback plugin for navigation requests
        handlerDidError: async () => {
          return new Response(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>TGATB - Offline</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                  body { 
                    font-family: system-ui, sans-serif; 
                    text-align: center; 
                    padding: 2rem; 
                    background: #f5f5f5;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                  }
                  .container {
                    max-width: 400px;
                    background: white;
                    padding: 2rem;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                  }
                  .icon { font-size: 4rem; margin-bottom: 1rem; }
                  h1 { color: #6750a4; margin-bottom: 1rem; }
                  p { color: #666; line-height: 1.5; margin-bottom: 2rem; }
                  button {
                    background: #6750a4; 
                    color: white; 
                    border: none; 
                    padding: 12px 24px; 
                    border-radius: 6px; 
                    cursor: pointer;
                    font-size: 16px;
                    transition: background-color 0.2s;
                  }
                  button:hover {
                    background: #5a47a0;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="icon">📱</div>
                  <h1>You're Offline</h1>
                  <p>TGATB Habit Tracker is available offline. Your habit data will sync when you're back online.</p>
                  <button onclick="window.location.reload()">Try Again</button>
                </div>
              </body>
            </html>
          `, {
            headers: { 'Content-Type': 'text/html' }
          });
        }
      }
    ]
  })
);

// Background sync removed - app uses client-side storage only
// All data is stored locally and doesn't require server sync

self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Time to check your habits!',
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/icon-72x72.svg',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'open',
          title: 'Open App',
          icon: '/icons/icon-96x96.svg'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification('TGATB Habit Tracker', options)
    );
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      self.clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// Sync functions removed - using client-side storage only
