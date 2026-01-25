self.addEventListener("push", function (event) {
    let data = {};
    if (event.data) {
        data = event.data.json();
    }

    const title = data.title || "New Message";
    const options = {
        body: data.body || "",
        icon: data.icon || "/avatar.png",
        badge: "/favicon.ico",
        tag: data.tag || Date.now(),
        timestamp: data.timestamp || Date.now(),
        data: {
            conversationId: data.conversationId,
        },
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: "window" }).then(clientList => {
            for (const client of clientList) {
                if ("focus" in client) {
                    client.focus();
                    client.postMessage({ conversationId: event.notification.data.conversationId });
                    return;
                }
            }
            if (clients.openWindow) {
                return clients.openWindow("/");
            }
        })
    );
});
