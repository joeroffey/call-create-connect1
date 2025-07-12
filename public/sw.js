// Service Worker for EezyBuild Offline Capabilities
const CACHE_NAME = 'eezybuild-v1';
const STATIC_CACHE = 'eezybuild-static-v1';
const DYNAMIC_CACHE = 'eezybuild-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  // Add other static assets as needed
];

// API endpoints to cache
const CACHEABLE_APIS = [
  '/rest/v1/projects',
  '/rest/v1/project_schedule_of_works',
  '/rest/v1/conversations',
  '/rest/v1/messages',
  '/rest/v1/teams',
  '/rest/v1/profiles'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests
  if (url.origin.includes('supabase') || CACHEABLE_APIS.some(api => url.pathname.includes(api))) {
    event.respondWith(networkFirstWithCacheFallback(request));
    return;
  }

  // Handle static assets
  if (STATIC_ASSETS.includes(url.pathname) || url.pathname.includes('/assets/')) {
    event.respondWith(cacheFirstWithNetworkFallback(request));
    return;
  }

  // Default: network first
  event.respondWith(networkFirstWithCacheFallback(request));
});

// Cache-first strategy (for static assets)
async function cacheFirstWithNetworkFallback(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Serving from cache:', request.url);
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    await cache.put(request, networkResponse.clone());
    console.log('[SW] Cached new resource:', request.url);
    return networkResponse;
  } catch (error) {
    console.log('[SW] Cache-first failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network-first strategy (for API calls)
async function networkFirstWithCacheFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put(request, networkResponse.clone());
      console.log('[SW] Updated cache:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Serving from cache fallback:', request.url);
      return cachedResponse;
    }
    
    // Return offline page or error response
    return new Response(JSON.stringify({ 
      error: 'Offline - No cached data available',
      offline: true 
    }), { 
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Background sync for when connection returns
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

// Sync offline data when connection returns
async function syncOfflineData() {
  try {
    console.log('[SW] Syncing offline data...');
    
    // Get offline data from IndexedDB
    const offlineData = await getOfflineData();
    
    if (offlineData.length > 0) {
      // Send data to main thread to handle sync
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_OFFLINE_DATA',
          data: offlineData
        });
      });
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Helper to get offline data (simplified - would use IndexedDB)
async function getOfflineData() {
  // This would typically read from IndexedDB
  // For now, return empty array
  return [];
}

// Listen for messages from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'STORE_OFFLINE_DATA') {
    // Store data for offline use
    storeOfflineData(event.data.data);
  }
});

// Store data for offline use
async function storeOfflineData(data) {
  // This would typically store in IndexedDB
  console.log('[SW] Storing offline data:', data);
}