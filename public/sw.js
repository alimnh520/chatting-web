self.addEventListener('push', e => {
    const data = e.data?.json() || {};
    const options = {
        body: data.body || "New message",
        icon: data.icon || "/icon-512.png",
        badge: data.badge || "/icon-512.png",
        vibrate: [200, 100, 200], // এই লাইনটা
        data
    };
    e.waitUntil(self.registration.showNotification(data.title || "New message", options));
});


self.addEventListener('notificationclick', e => {
    e.notification.close();
    const url = e.notification.data?.url || '/';
    e.waitUntil(clients.openWindow(url));
});
