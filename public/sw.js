self.addEventListener("install", (event) => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    self.clients.claim();
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
            if (clientList.length > 0) {
                return clientList[0].focus();
            }
            return clients.openWindow("/");
        })
    );
});
