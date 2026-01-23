// pages/api/subscribe.js
import webpush from 'web-push';

webpush.setVapidDetails(
    'mailto:test@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

let subscriptions = []; // মেমরিতে রাখছি, ডাটাবেস লাগবে না

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { subscription } = req.body;
        subscriptions.push(subscription);
        res.status(201).json({ success: true });
    } else if (req.method === 'GET') {
        res.status(200).json({ subscriptions });
    } else {
        res.status(405).end();
    }
}
