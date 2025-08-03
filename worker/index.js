// Custom Worker for TGATB Habit Tracker
// This extends Workbox with our custom functionality

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Allow workbox to handle precaching
precacheAndRoute(self.__WB_MANIFEST);
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

// API Routes - Special handling for habit tracking
registerRoute(
  /^.*\/api\/habits.*$/,
  new NetworkFirst({
    cacheName: 'habit-api',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 32,
        maxAgeSeconds: 60 * 60 // 1 hour
      })
    ]
  })
);

// Custom functionality for habit tracking
self.addEventListener('sync', event => {
  if (event.tag === 'habit-sync') {
    event.waitUntil(syncOfflineHabits());
  }
});

self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Time to check your habits!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'open',
          title: 'Open App',
          icon: '/icons/icon-96x96.png'
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

// Custom background sync for offline habit data
async function syncOfflineHabits() {
  console.log('[SW] Syncing offline habits...');
  
  try {
    // Get offline habit data from IndexedDB
    const offlineData = await getOfflineHabitData();
    
    if (offlineData.length > 0) {
      // Sync each habit log
      for (const habitLog of offlineData) {
        try {
          await fetch('/api/habits/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(habitLog)
          });
          
          // Remove from offline storage after successful sync
          await removeOfflineHabitData(habitLog.id);
        } catch (error) {
          console.error('[SW] Failed to sync habit:', error);
        }
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// IndexedDB helpers for offline storage
async function getOfflineHabitData() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TGATB-OfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['habits'], 'readonly');
      const store = transaction.objectStore('habits');
      const getAll = store.getAll();
      
      getAll.onsuccess = () => resolve(getAll.result || []);
      getAll.onerror = () => reject(getAll.error);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('habits')) {
        const store = db.createObjectStore('habits', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

async function removeOfflineHabitData(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TGATB-OfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['habits'], 'readwrite');
      const store = transaction.objectStore('habits');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Custom offline page handler
registerRoute(
  ({ request }) => request.mode === 'navigate',
  async ({ event }) => {
    try {
      return await fetch(event.request);
    } catch (error) {
      // Return custom offline page with branding
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
);
