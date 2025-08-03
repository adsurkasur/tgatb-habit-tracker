// TGATB Habit Tracker Service Worker
// Simplified and optimized for better maintainability

const CACHE_VERSION = 'v1';
const CACHE_NAMES = {
  static: `tgatb-static-${CACHE_VERSION}`,
  dynamic: `tgatb-dynamic-${CACHE_VERSION}`,
  habits: `tgatb-habits-${CACHE_VERSION}`
};

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', handleInstall);
self.addEventListener('fetch', handleFetch);
self.addEventListener('activate', handleActivate);
self.addEventListener('sync', handleBackgroundSync);
self.addEventListener('push', handlePushNotification);
self.addEventListener('notificationclick', handleNotificationClick);

async function handleInstall(event) {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    cacheStaticAssets()
  );
  
  // Take control immediately
  self.skipWaiting();
}

async function handleActivate(event) {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    Promise.all([
      cleanupOldCaches(),
      self.clients.claim()
    ])
  );
}

async function handleFetch(event) {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP requests
  if (!url.protocol.startsWith('http')) return;
  
  // Handle different request types
  if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else {
    event.respondWith(handlePageRequest(request));
  }
}

async function handleBackgroundSync(event) {
  if (event.tag === 'habit-sync') {
    event.waitUntil(syncOfflineHabits());
  }
}

async function handlePushNotification(event) {
  const options = createNotificationOptions(event.data);
  event.waitUntil(
    self.registration.showNotification('TGATB Habit Tracker', options)
  );
}

async function handleNotificationClick(event) {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(self.clients.openWindow('/'));
  }
}

// Helper functions
async function cacheStaticAssets() {
  const cache = await caches.open(CACHE_NAMES.static);
  return cache.addAll(STATIC_ASSETS);
}

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name.startsWith('tgatb-') && !Object.values(CACHE_NAMES).includes(name)
  );
  
  return Promise.all(
    oldCaches.map(name => caches.delete(name))
  );
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/');
}

function isStaticAsset(url) {
  const staticExtensions = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i;
  return staticExtensions.test(url.pathname);
}

async function handleAPIRequest(request) {
  try {
    const response = await fetch(request);
    
    // Cache successful habit-related API responses
    if (request.url.includes('/api/habits') && response.ok) {
      const cache = await caches.open(CACHE_NAMES.habits);
      cache.put(request.clone(), response.clone());
    }
    
    return response;
  } catch (error) {
    // Return cached version for habit requests when offline
    if (request.url.includes('/api/habits')) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) return cachedResponse;
    }
    
    throw error;
  }
}

async function handleStaticAsset(request) {
  const cache = await caches.open(CACHE_NAMES.static);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Return cached version and update in background
    fetchAndCache(request, cache);
    return cachedResponse;
  }
  
  return fetchAndCache(request, cache);
}

async function handlePageRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    // Return cached main page for navigation requests when offline
    if (request.mode === 'navigate') {
      const cache = await caches.open(CACHE_NAMES.static);
      return cache.match('/') || createOfflinePage();
    }
    
    throw error;
  }
}

async function fetchAndCache(request, cache) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request.clone(), response.clone());
    }
    
    return response;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;
    throw error;
  }
}

async function syncOfflineHabits() {
  console.log('[SW] Syncing offline habits...');
  // This would implement actual sync logic
  // For now, just log the intent
}

function createNotificationOptions(data) {
  const message = data ? data.text() : 'Time to check your habits!';
  
  return {
    body: message,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ],
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };
}

function createOfflinePage() {
  const offlineHTML = `
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
          }
          .container {
            max-width: 400px;
            margin: 2rem auto;
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .icon { font-size: 4rem; margin-bottom: 1rem; }
          h1 { color: #6750a4; margin-bottom: 1rem; }
          p { color: #666; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">📱</div>
          <h1>You're Offline</h1>
          <p>TGATB Habit Tracker is available offline. Your data will sync when you're back online.</p>
          <button onclick="window.location.reload()" style="
            background: #6750a4; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 6px; 
            cursor: pointer;
            margin-top: 1rem;
          ">Try Again</button>
        </div>
      </body>
    </html>
  `;
  
  return new Response(offlineHTML, {
    headers: { 'Content-Type': 'text/html' }
  });
}
