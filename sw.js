// Service Worker (anti-cache + auto update)
const VERSION = 'autowa-v3';
const BASE_PATH = '/WaDir/';

const PRECACHE = [
  `${BASE_PATH}`,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}manifest.json`,
  `${BASE_PATH}icons/icon-192.png`,
  `${BASE_PATH}icons/icon-512.png`
];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // langsung pakai SW baru
  e.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(PRECACHE))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => (k !== VERSION ? caches.delete(k) : Promise.resolve())));
      await self.clients.claim(); // kontrol semua tab
    })()
  );
});

// Network-first untuk HTML/JS biar update cepat; Cache-first untuk icon/manifest
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // hanya handle dalam scope repo
  if (!url.pathname.startsWith(BASE_PATH)) return;

  const isAsset = /\.(png|jpg|jpeg|gif|webp|svg|ico|json)$/i.test(url.pathname);
  const isHtmlJs = /\.(html|js)$/i.test(url.pathname) || url.pathname === `${BASE_PATH}`;

  if (isHtmlJs) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(VERSION).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  if (isAsset) {
    e.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req).then((res) => {
          const resClone = res.clone();
          caches.open(VERSION).then((cache) => cache.put(req, resClone));
          return res;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }

  // default: try cache, else network
  e.respondWith(
    caches.match(req).then((res) => res || fetch(req))
  );
});
