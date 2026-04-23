const CACHE_NAME = 'directory-v1'
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

// Activate: clean up old caches
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) {
            return key !== CACHE_NAME
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

  // Do NOT cache API calls — always fetch fresh
  if (url.pathname.startsWith('/api/')) return

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
