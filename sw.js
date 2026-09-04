// ==========================================
// 🚀 SERVICE WORKER: AVES DE ARGENTINA (v122)
// ==========================================
const CACHE_NAME = 'aves-v122';

const assets = [
  '/',
  'index.html',
  'style.css',
  'script_v2.js',
  'manifest.json',
  'sonidos/voltear.mp3',
  'sonidos/acierto.mp3'
];

// Instalación: cachear uno por uno (un archivo faltante no rompe todo)
self.addEventListener('install', function(event) {
  event.waitUntil((async function() {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(assets.map(function(a) { return cache.add(a); }));
    await self.skipWaiting();
  })());
});

// Activación: limpiar cachés viejas y tomar control de las pestañas abiertas
self.addEventListener('activate', function(event) {
  event.waitUntil((async function() {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(function(cache) {
      if (cache !== CACHE_NAME) return caches.delete(cache);
    }));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', function(event) {
  const req = event.request;

  // HTML: red primero (siempre fresco), caché como respaldo offline
  if (req.mode === 'navigate' || req.url.endsWith('index.html')) {
    event.respondWith((async function() {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone());
        return fresh;
      } catch (e) {
        const cached = await caches.match(req);
        return cached || Response.error();
      }
    })());
    return;
  }

  // Resto (css, js, imágenes, sonidos): caché primero, red como respaldo,
  // y se guarda en caché la primera vez que se trae (incluye las fotos de aves)
  event.respondWith((async function() {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const fresh = await fetch(req);
      if (fresh && fresh.ok && new URL(req.url).origin === location.origin) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone());
      }
      return fresh;
    } catch (e) {
      return Response.error();
    }
  })());
});