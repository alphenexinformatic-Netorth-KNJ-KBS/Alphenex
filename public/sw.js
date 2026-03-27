const CACHE_NAME = 'alphenex-offline-v1';
const OFFLINE_URL = '/index.html';

// Assets to cache for the most basic offline experience
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  // Note: Add other critical assets if needed, but keeping it minimal for now
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests for navigation or static assets
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).catch(() => {
      // If fetch fails (offline), try the cache
      return caches.match(event.request).then((response) => {
        if (response) return response;
        
        // If it's a navigation request and not in cache, return the offline index.html
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
        
        return Promise.reject('no-match');
      });
    })
  );
});
