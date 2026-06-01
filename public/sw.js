// WorkNest Service Worker
// Provides offline fallback and caches static assets for PWA installability.

const CACHE_NAME = 'worknest-v1';
const OFFLINE_URL = '/';

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/worknest-icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Remove old caches
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip tRPC and Supabase API calls — always go to network
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() =>
        caches.match(OFFLINE_URL)
      );
    })
  );
});
