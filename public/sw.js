self.addEventListener('push', function(e) {
  const data = e.data ? e.data.json() : {}
  self.registration.showNotification(data.title || 'SalesPath', {
    body: data.body || '오늘 연락할 고객이 있어요!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' }
  })
})

self.addEventListener('notificationclick', function(e) {
  e.notification.close()
  e.waitUntil(clients.openWindow(e.data.url || '/'))
})
