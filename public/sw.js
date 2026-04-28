const CACHE_NAME = 'directory-v4'
const API_CACHE = 'api-data-v2'

// ---------- INSTALL (no addAll; never fail) ----------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        const res = await fetch('/', { cache: 'no-store' })
        if (res && res.ok) await cache.put('/', res.clone())
      } catch (e) {
        console.warn('[SW] install: skip caching /', e)
      }
    })
  )
  self.skipWaiting()
})

// ---------- ACTIVATE ----------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// ---------- FETCH ----------
self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)

  // Normalize query params (avoids duplicate cache keys)
  url.searchParams.sort()
  const normalized = new Request(url.toString(), {
    method: req.method,
    headers: req.headers,
    credentials: req.credentials,
  })

  // 1) RSC (Next App Router)  -------------------------
  if (url.searchParams.has('_rsc')) {
    event.respondWith(staleWhileRevalidate(normalized, API_CACHE))
    return
  }

  // 2) Next data JSON --------------------------------
  if (url.pathname.startsWith('/_next/data/')) {
    event.respondWith(staleWhileRevalidate(normalized, API_CACHE))
    return
  }

  // 3) Your API --------------------------------------
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(staleWhileRevalidate(normalized, API_CACHE, true))
    return
  }

  // 4) Navigation (HTML) ------------------------------
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((c) => c.put(req, clone))
          return res
        })
        .catch(async () => {
          // Always return app shell
          const cache = await caches.open(CACHE_NAME)
          return (
            (await cache.match('/')) ||
            new Response('<h1>Offline</h1>', {
              headers: { 'Content-Type': 'text/html' },
            })
          )
        })
    )
    return
  }

  // 5) Static + Next assets ---------------------------
  if (
    url.pathname.startsWith('/_next/') ||
    req.destination === 'script' ||
    req.destination === 'style' ||
    req.destination === 'image' ||
    req.destination === 'font'
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached
        return fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const clone = res.clone()
              caches.open(CACHE_NAME).then((c) => c.put(req, clone))
            }
            return res
          })
          .catch(() => cached) // don't throw
      })
    )
    return
  }

  // 6) Everything else (manifest, favicon, etc.) ------
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached
      return fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((c) => c.put(req, clone))
          }
          return res
        })
        .catch(
          () =>
            cached ||
            new Response('', { status: 200 }) // never crash offline
        )
    })
  )
})

// ---------- helpers ----------
async function staleWhileRevalidate(request, cacheName, broadcast = false) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  const network = fetch(request)
    .then(async (res) => {
      if (res && res.ok) {
        await cache.put(request, res.clone())
        if (broadcast) {
          const clients = await self.clients.matchAll()
          clients.forEach((c) =>
            c.postMessage({ type: 'CACHE_UPDATED', url: request.url })
          )
        }
      }
      return res
    })
    .catch(() => cached)

  return cached || network
}