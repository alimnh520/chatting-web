export default async function subscribeUser(userId) {
    const registration = await navigator.serviceWorker.register("/sw.js");

    const old = await registration.pushManager.getSubscription();
    if (old) await old.unsubscribe();

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId,
            subscription
        }),
    });
}
