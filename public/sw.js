self.addEventListener("push", function (event) {
    const data = event.data.json();
    const options = {
        body: data.text,
        icon: data.icon || "/icon.png",
        data: { url: data.url || "/" }
    };
    event.waitUntil(
        self.registration.showNotification(data.title || "New Message", options)
    );
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();
    const url = event.notification.data.url || "/";
    event.waitUntil(clients.openWindow(url));
});
