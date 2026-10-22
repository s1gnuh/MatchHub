// MatchHub service worker: precaches all build assets, handles push notifications,
// and serves the app shell offline.
// Built via vite-plugin-pwa injectManifest — self.__WB_MANIFEST is replaced at build time.

const PRECACHE_MANIFEST = self.__WB_MANIFEST
const SHELL = 'matchhub-shell-v2'
const IMAGES = 'matchhub-img-v2'
const FONTS = 'matchhub-fonts-v2'
const SCOPE = self.registration.scope

// --- Install: precache all hashed build assets ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL)
      .then((cache) => cache.addAll(PRECACHE_MANIFEST.map((e) => (typeof e === 'string' ? e : e.url))))
      .then(() => self.skipWaiting()),
  )
})

// --- Activate: drop caches from previous versions ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => ![SHELL, IMAGES, FONTS].includes(k)).map((k) => caches.delete(k)),
      ))
      .then(() => self.clients.claim()),
  )
})

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  const network = fetch(request)
    .then((res) => { if (res.ok || res.type === 'opaque') cache.put(request, res.clone()); return res })
    .catch(() => cached)
  return cached ?? network
}

// Network-first for navigation so a new deploy is visible on next open.
async function navigate(request) {
  const cache = await caches.open(SHELL)
  try {
    const res = await fetch(request)
    if (res.ok) cache.put(SCOPE, res.clone())
    return res
  } catch {
    return (await cache.match(SCOPE)) ?? Response.error()
  }
}

// Serve precached assets instantly; fall back to network and add to cache.
async function serveAsset(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  const res = await fetch(request)
  if (res.ok) {
    const cache = await caches.open(SHELL)
    cache.put(request, res.clone())
  }
  return res
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  if (url.pathname.startsWith('/api/')) return // data requests bypass SW

  if (url.origin === self.location.origin) {
    if (request.mode === 'navigate') return event.respondWith(navigate(request))
    return event.respondWith(serveAsset(request))
  }

  if (url.hostname === 'crests.football-data.org') return event.respondWith(staleWhileRevalidate(request, IMAGES))
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    return event.respondWith(staleWhileRevalidate(request, FONTS))
  }
})

// --- Push notification ---
self.addEventListener('push', (event) => {
  if (!event.data) return
  let payload
  try { payload = event.data.json() } catch { return }
  const { title, body, url, tag } = payload
  event.waitUntil(
    self.registration.showNotification(title ?? 'MatchHub', {
      body: body ?? '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: tag ?? 'matchhub',
      renotify: true,
      data: { url: url ?? '/' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const open = list.find((c) => c.url.startsWith(self.registration.scope))
      if (open) { open.navigate(target); return open.focus() }
      return clients.openWindow(target)
    }),
  )
})
