self.addEventListener('push', function (event) {
    const data = event.data.json();
    const title = data.title || 'New Message';
    const options = {
        body: data.body,
        icon: data.icon || '/icon-512.png',
        badge: data.badge || '/icon-512.png',
        data: { url: data.url || '/' },
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    const url = event.notification.data.url;
    event.waitUntil(clients.openWindow(url));
});
