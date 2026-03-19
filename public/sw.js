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
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // Only cache successful GET requests to our own origin
        if (event.request.method === 'GET' && fetchResponse.status === 200) {
          const cacheCopy = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cacheCopy);
          });
        }
        return fetchResponse;
      });
    })
  );
});
