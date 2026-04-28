const CACHE_NAME = 'directory-v3'
const API_CACHE_NAME = 'api-data-v1'

// Minimal shell (Next handles rest dynamically)
const SHELL_ASSETS = ['/']

// --------------------
// INSTALL
// --------------------
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(SHELL_ASSETS)
    })
  )
  self.skipWaiting()
})

// --------------------
// ACTIVATE
// --------------------
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) {
            return key !== CACHE_NAME && key !== API_CACHE_NAME
          })
          .map(function (key) {
            return caches.delete(key)
          })
      )
    })
  )
  self.clients.claim()
})

// --------------------
// PUSH NOTIFICATIONS
// --------------------
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: data.icon || '/icon.png',
      badge: '/badge.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
      },
    }
    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  event.waitUntil(clients.openWindow('/'))
})

// --------------------
// FETCH HANDLER
// --------------------
self.addEventListener('fetch', function (event) {
  const request = event.request
  const url = new URL(request.url)

  // Normalize URL (prevents duplicate cache entries)
  url.searchParams.sort()
  const normalizedRequest = new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
    credentials: request.credentials,
  })

  // --------------------
  // 1. NEXT DATA (CRITICAL FIX)
  // --------------------
  if (url.pathname.startsWith('/_next/data/')) {
    event.respondWith(
      caches.match(normalizedRequest).then(function (cached) {
        const networkFetch = fetch(normalizedRequest)
          .then(function (response) {
            if (response && response.ok) {
              const clone = response.clone()
              caches.open(API_CACHE_NAME).then(function (cache) {
                cache.put(normalizedRequest, clone)
              })
            }
            return response
          })
          .catch(function () {
            return cached
          })

        return cached || networkFetch
      })
    )
    return
  }

  // --------------------
  // 2. API (SWR)
  // --------------------
  if (url.pathname.startsWith('/api/')) {
    const networkFetch = fetch(normalizedRequest)

    const bgUpdate = networkFetch
      .then(function (response) {
        if (!response || !response.ok) return

        return caches
          .open(API_CACHE_NAME)
          .then(function (cache) {
            return cache.put(normalizedRequest, response.clone())
          })
          .then(function () {
            return self.clients.matchAll()
          })
          .then(function (clients) {
            clients.forEach(function (c) {
              c.postMessage({
                type: 'CACHE_UPDATED',
                url: normalizedRequest.url,
              })
            })
          })
      })
      .catch(function () {})

    event.waitUntil(bgUpdate)

    event.respondWith(
      caches
        .open(API_CACHE_NAME)
        .then(function (cache) {
          return cache.match(normalizedRequest)
        })
        .then(function (cached) {
          return cached || networkFetch
        })
        .catch(function () {
          return new Response(JSON.stringify({ error: 'offline' }), {
            headers: { 'Content-Type': 'application/json' },
          })
        })
    )
    return
  }

  // --------------------
  // 3. NAVIGATION (HTML PAGES)
  // --------------------
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, clone)
          })
          return response
        })
        .catch(function () {
          return caches.match(request).then(function (cached) {
            return cached || caches.match('/')
          })
        })
    )
    return
  }

  // --------------------
  // 4. STATIC + NEXT ASSETS
  // --------------------
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.match(
      /\.(js|css|png|jpg|jpeg|svg|gif|webp|woff2?|ttf|ico)$/
    )
  ) {
    event.respondWith(
      caches.match(request).then(function (cached) {
        if (cached) return cached

        return fetch(request).then(function (response) {
          if (!response || !response.ok) return response

          const clone = response.clone()
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, clone)
          })
          return response
        })
      })
    )
    return
  }
})