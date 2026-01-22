import { subscriptions } from './sharedSubscriptions';
import webpush from 'web-push';

webpush.setVapidDetails(
    "mailto:test@test.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

export async function sendPushNotification(data) {
    const payload = JSON.stringify({
        title: data.username,
        text: data.text,
        icon: data.icon,
        url: `/`,
    });

    for (const sub of subscriptions) {
        await webpush.sendNotification(sub, payload).catch(err => console.error(err));
    }
}
