import webpush from "web-push";

webpush.setVapidDetails(
    "mailto:test@test.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    const data = req.body;

    const payload = JSON.stringify({
        title: data.title,
        body: data.body,
        icon: data.icon,
        url: "/"
    });

    const subs = global.subscriptions || [];

    await Promise.all(
        subs.map(sub =>
            webpush.sendNotification(sub, payload).catch(() => { })
        )
    );

    res.json({ success: true });
}
