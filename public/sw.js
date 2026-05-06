const CACHE_NAME = 'aurabeat-v2-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// v2.1.0 - Force Update
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clear old caches
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // 1. Skip non-HTTP(S)
  if (!url.protocol.startsWith('http')) return;
  
  // 2. Skip DEV server
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return;
  
  // 3. EXTREMELY IMPORTANT: Skip ALL API requests
  // We check for common API indicators to prevent the SW from intercepting data
  if (
    url.origin !== self.location.origin || 
    url.pathname.includes('/jio') || 
    url.pathname.includes('/api/') ||
    url.hostname.includes('vercel.app') ||
    url.hostname.includes('saavn.me')
  ) {
    return;
  }

  // 4. Cache-first strategy for local assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const toCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, toCache);
        });
        
        return response;
      }).catch(() => {
        // Fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        return null;
      });
    })
  );
});
