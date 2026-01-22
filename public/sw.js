self.addEventListener("push", function (event) {
    const data = event.data.json();
    const options = {
        body: data.text,
        icon: data.icon,
        data: { conversationId: data.conversationId }
    };
    event.waitUntil(
        self.registration.showNotification(data.username, options)
    );
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(`/chat/${event.notification.data.conversationId}`)
    );
});
