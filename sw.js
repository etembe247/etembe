const ASSET_CACHE = 'etembe-assets-v1';
const API_CACHE = 'etembe-api-v1';
const SHELL_CACHE = 'etembe-shell-v1';
const API_HOSTS = new Set(['api.puter.com', 'text.pollinations.ai', 'image.pollinations.ai']);

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(ASSET_CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw new Error('Offline and no cached response is available.');
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const isAsset = url.origin === self.location.origin && (url.pathname.startsWith('/assets/') || /\.(?:css|js|png|jpg|jpeg|webp|svg|woff2?)$/i.test(url.pathname));
  if (isAsset) { event.respondWith(cacheFirst(request)); return; }
  if (API_HOSTS.has(url.hostname)) { event.respondWith(networkFirst(request, API_CACHE)); return; }
  if (request.mode === 'navigate' && url.origin === self.location.origin) { event.respondWith(networkFirst(request, SHELL_CACHE)); }
});
