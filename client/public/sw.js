self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Protect your streak! Log today\'s expense.',
      icon: data.icon || '/icon-192.png',
      badge: data.badge || '/icon-192.png',
      data: { url: data.url || '/' }
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Spendly Reminder', options)
    );
  } catch (err) {
    console.error('Failed to parse push notification payload:', err);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
