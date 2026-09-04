// ==========================================
// 🚀 SERVICE WORKER: AVES DE ARGENTINA (v123)
// ==========================================
const CACHE_NAME = 'aves-v123';

const assets = [
  '/',
  'index.html',
  'style.css',
  'script_v2.js',
  'manifest.json',
  'sonidos/voltear.mp3',
  'sonidos/acierto.mp3'
];

// Instalación del Service Worker y almacenamiento de archivos básicos
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(assets);
    })
  );
});

// Activación y limpieza de cachés viejas congeladas
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cache) {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Respuesta inmediata desde la caché para asegurar el modo offline
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
