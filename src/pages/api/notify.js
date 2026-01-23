import webpush from 'web-push';
import { subscriptions } from './subscribe';

webpush.setVapidDetails(
    'mailto:test@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { title, body, icon } = req.body;

        const payload = JSON.stringify({
            title,
            body,
            icon,
            timestamp: Date.now(),
        });

        const sendNotifications = subscriptions.map(sub =>
            webpush.sendNotification(sub, payload).catch(err => console.error(err))
        );

        await Promise.all(sendNotifications);

        res.status(200).json({ success: true });
    } else {
        res.status(405).end();
    }
}
