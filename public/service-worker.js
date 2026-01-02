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
    const conversationId = event.notification.data?.conversationId;

    if (!conversationId) return;

    const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    let chatClient = allClients.find(c => c.visibilityState === 'visible');

    if (chatClient) {
        chatClient.focus();
        chatClient.postMessage({ type: 'open-chat', conversationId });
    } else {
        chatClient = await clients.openWindow(`/chat?conversationId=${conversationId}`);
    }
});

