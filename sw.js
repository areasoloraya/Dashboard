// Service worker kerangka: tab tetap bisa dibuka (halaman pembungkus + ikon) walau koneksi putus sesaat.
// Data & tampilan dashboard sendiri dilayani Apps Script (lintas-origin), jadi TIDAK ikut di-cache di sini.
// Nama cache dibuat unik + hanya menghapus cache berawalan sama, karena semua repo GitHub Pages milik satu akun berbagi satu origin.
const PREFIX = 'dashboard-sosri-shell-', V = PREFIX + 'v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x.startsWith(PREFIX) && x !== V).map(x => caches.delete(x)))));
  self.clients.claim();
});
// Jaringan dulu (selalu dapat file terbaru), cache hanya sebagai cadangan saat offline.
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(r => { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); return r; })
      .catch(() => caches.match(e.request))
  );
});
