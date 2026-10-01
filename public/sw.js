// MatchHub service worker: makes the app installable and lets the shell open offline.
// API calls are never handled here (the app has its own cache with an offline fallback).

const VERSION = 'v1'
const SHELL = `matchhub-shell-${VERSION}`
const IMAGES = `matchhub-img-${VERSION}`
const SCOPE = self.registration.scope
// Crests and web fonts come from these hosts; cache them so they also show offline.
const EXTERNAL = ['crests.football-data.org', 'fonts.googleapis.com', 'fonts.gstatic.com']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL).then((c) => c.addAll(['./', 'manifest.webmanifest', 'logo.svg'])).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => ![SHELL, IMAGES].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

// Serve from cache right away and refresh it in the background.
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  const network = fetch(request)
    .then((res) => {
      if (res.ok || res.type === 'opaque') cache.put(request, res.clone())
      return res
    })
    .catch(() => cached)
  return cached || network
}

// Pages: try the network first so a new deploy shows up, fall back to the cached shell offline.
async function navigate(request) {
  const cache = await caches.open(SHELL)
  try {
    const res = await fetch(request)
    if (res.ok) cache.put(SCOPE, res.clone())
    return res
  } catch {
    return (await cache.match(SCOPE)) || Response.error()
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  if (url.origin === self.location.origin) {
    if (url.pathname.includes('/api/')) return // data requests go straight to the network
    if (request.mode === 'navigate') return event.respondWith(navigate(request))
    return event.respondWith(staleWhileRevalidate(request, SHELL))
  }
  if (EXTERNAL.includes(url.hostname)) event.respondWith(staleWhileRevalidate(request, IMAGES))
})
