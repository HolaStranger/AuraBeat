const CACHE_NAME = 'retrotape-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // CSS and JS are hashed, so we rely on runtime caching for those
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  // Force the waiting service worker to become the active service worker immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of all open pages immediately without waiting for a refresh
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip caching for non-HTTP(S) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Skip caching for dev server (localhost)
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return;
  }
  
  // Skip caching for ALL cross-origin requests (API calls, CDNs, etc.)
  // This prevents the SW from intercepting API calls and returning 'Offline' text
  if (url.origin !== self.location.origin) {
    return;
  }

  // Skip caching for WebSocket and non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      
      return fetch(event.request).then((fetchResponse) => {
        // Only cache successful responses
        if (fetchResponse.status !== 200) {
          return fetchResponse;
        }
        
        const cacheCopy = fetchResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          try {
            cache.put(event.request, cacheCopy);
          } catch (err) {
            console.warn('Cache write failed:', err);
          }
        }).catch((err) => {
          console.warn('Cache open failed:', err);
        });
        
        return fetchResponse;
      }).catch((err) => {
        console.warn('Fetch failed:', err);
        return caches.match(event.request).then(cached => {
          return cached || new Response('Offline', { 
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      });
    })
  );
});
