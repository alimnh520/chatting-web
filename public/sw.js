const CACHE_NAME = "chat-cache-v1";
const urlsToCache = [
    "/",
    "/index.html",
    "/offline.html",
    "/icon-512.png"
];

// Install event
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch event
self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match("/offline.html"))
    );
});

// Notification click event
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
