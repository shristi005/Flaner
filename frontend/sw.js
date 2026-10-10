// Keeps the app and the current plan available offline once they have loaded.
// Network first (so updates arrive), cache as the fallback. API calls are never cached.
const V = 'flaner-v2';
const SHELL = ['/', '/css/style.css', '/js/config.js', '/js/data.js', '/js/app.js', '/js/api.js', '/js/auth.js', '/vendor/supabase.js', '/vendor/591.supabase.js',
  '/fonts/figtree-latin-wght-normal.woff2', '/fonts/fraunces-latin-wght-normal.woff2', '/fonts/fraunces-latin-wght-italic.woff2', '/assets/logo.svg'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  e.respondWith(
    fetch(r).then(res => { if (res.ok) { const copy = res.clone(); caches.open(V).then(c => c.put(r, copy)); } return res; })
      .catch(() => caches.match(r).then(m => m || caches.match('/')))
  );
});
