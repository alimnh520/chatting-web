self.addEventListener('push', event => {
    const data = event.data.json();

    const options = {
        body: data.body,
        icon: data.icon || '/icon-512.png',
        data: data,
        timestamp: data.timestamp
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Notification', options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});
