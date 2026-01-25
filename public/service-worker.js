self.addEventListener('push', function (event) {
    const data = event.data.json();
    const title = data.title || 'New Message';
    const options = {
        body: data.body,
        icon: data.icon || '/icon-512.png', // sender image
        badge: data.badge || '/icon-512.png',
        data: { url: data.url || '/' },
        vibrate: [200, 100, 200], // হালকা vibration
        requireInteraction: true, // নোটিফিকেশন ইউজার ক্লিক না করলে নিজে চলে যাবে না
        silent: false, // ফোনের default ringtone off নয়
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    const url = event.notification.data.url;
    event.waitUntil(clients.openWindow(url));
});
