// Sürüm numarasını her güncellemede artır: telefonlar yeni dosyaları böyle alır.
const CACHE = 'meydan-v4';
const JSPDF = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'logo-oval.png', 'logo-banner.jpg',
  'icon-192.png', 'icon-512.png', 'icon-512-maskable.png', 'apple-touch-icon.png', 'favicon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES).then(() => c.add(JSPDF).catch(() => {}))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Google Fonts: önce önbellek
  if (url.hostname.endsWith('googleapis.com') || url.hostname.endsWith('gstatic.com') || url.hostname === 'cdnjs.cloudflare.com') {
    e.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { c.put(req, r.clone()); return r; }))));
    return;
  }
  if (url.origin !== location.origin) return;
  // Kendi dosyalarımız: önce internet (güncel kalsın), yoksa önbellek
  e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; })
    .catch(() => caches.match(req, {ignoreSearch: true}).then(hit => hit || caches.match('index.html'))));
});
