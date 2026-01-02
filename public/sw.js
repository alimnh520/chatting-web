self.addEventListener("push", function (event) {
    const data = event.data.json();

    self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || "/icon-512.png",
        badge: "/icon-512.png",
        data: data.url,
    });
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data || "/")
    );
});
