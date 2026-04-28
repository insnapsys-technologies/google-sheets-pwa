const CACHE_NAME = 'directory-v2'
const API_CACHE_NAME = 'api-data-v1'
const SHELL_ASSETS = ['/', '/blog']

// Install: pre-cache the app shell
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(SHELL_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate: clean up old caches (including previous directory-v1)
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
  console.log('Notification click received.')
  event.notification.close()
  event.waitUntil(clients.openWindow('/'))
})

self.addEventListener('fetch', function (event) {
  const url = new URL(event.request.url)

  // Stale-While-Revalidate for API calls:
  // 1. Respond with cached data immediately (if available)
  // 2. Always fetch network in parallel → update cache → notify clients
  if (url.pathname.startsWith('/api/')) {
    const request = event.request

    // Start network fetch immediately — runs in parallel with cache lookup
    const networkFetch = fetch(request.clone())

    // Background pipeline: cache the fresh response, then postMessage all clients
    const bgUpdate = networkFetch
      .then(function (response) {
        if (!response.ok) return
        return caches
          .open(API_CACHE_NAME)
          .then(function (cache) {
            return cache.put(request, response.clone())
          })
          .then(function () {
            return self.clients.matchAll()
          })
          .then(function (clients) {
            clients.forEach(function (c) {
              c.postMessage({ type: 'CACHE_UPDATED', url: request.url })
            })
          })
      })
      .catch(function () {})

    // Keep SW alive until cache write + notifications complete
    event.waitUntil(bgUpdate)

    // Respond: cached (stale) immediately, or wait for network if no cache yet
    event.respondWith(
      caches
        .open(API_CACHE_NAME)
        .then(function (cache) {
          return cache.match(request)
        })
        .then(function (cached) {
          return cached || networkFetch
        })
        .catch(function () {
          return caches.match(request)
        })
    )
    return
  }

  // Network-first for page navigations, cache as fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(function (response) {
          var clone = response.clone()
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, clone)
          })
          return response
        })
        .catch(function () {
          return caches.match(event.request).then(function (cached) {
            return cached || caches.match('/')
          })
        })
    )
    return
  }

  // Cache-first for static assets (JS, CSS, images, fonts)
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff2?|ttf|ico)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then(function (cached) {
        return (
          cached ||
          fetch(event.request).then(function (response) {
            var clone = response.clone()
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(event.request, clone)
            })
            return response
          })
        )
      })
    )
    return
  }
})
