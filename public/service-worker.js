self.addEventListener('push', function (event) {
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/icon-512.png',
        badge: '/icon-512.png'
    };
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', async function (event) {
    event.notification.close();
    const conversationId = event.notification.data.conversationId;

    const clientsArr = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    const client = clientsArr.find(c => c.visibilityState === 'visible');

    if (client) {
        client.focus();
        client.postMessage({ type: 'open-chat', conversationId });
    } else {
        clients.openWindow(`/chat?conversationId=${conversationId}`);
    }
});
