self.addEventListener('push', function (event) {
    const data = event.data.json();

    const options = {
        body: data.body,
        icon: '/icon-512.png',
        badge: '/icon-512.png',
        data: {
            conversationId: data.conversationId
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    const urlToOpen = self.location.origin;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(windowClients => {
                for (let client of windowClients) {
                    if (client.url.startsWith(urlToOpen)) {
                        return client.focus();
                    }
                }
                return clients.openWindow(urlToOpen);
            })
    );
});
