self.addEventListener("install", (event) => {
    console.log("✅ Service Worker installed");
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    console.log("✅ Service Worker activated");
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
