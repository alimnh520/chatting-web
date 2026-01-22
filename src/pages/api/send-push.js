import webpush from "web-push";
import { subscriptions } from "./sharedSubscriptions";

webpush.setVapidDetails(
    "mailto:test@test.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

export async function sendPushNotification(data) {
    const payload = JSON.stringify({
        title: data.username || "New message",
        text: data.text || "📩 New message",
        icon: data.icon || "/icon.png",
        url: "/",
    });

    console.log("Sending push to", subscriptions.length, "subs");

    for (const sub of subscriptions) {
        try {
            await webpush.sendNotification(sub, payload);
        } catch (err) {
            console.error("Push error:", err);
        }
    }
}
