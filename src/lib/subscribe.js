// utils/subscribe.js
export async function subscribeUser() {
    if ('serviceWorker' in navigator) {
        const sw = await navigator.serviceWorker.register('/service-worker.js');

        const subscription = await sw.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            ),
        });

        await fetch('/api/subscribe', {
            method: 'POST',
            body: JSON.stringify({ subscription }),
            headers: { 'Content-Type': 'application/json' },
        });

        console.log('Subscribed for push notifications!');
    }
}

// helper function
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}
