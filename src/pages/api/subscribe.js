let subscriptions = global.subscriptions || [];
global.subscriptions = subscriptions;

export default function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    const sub = req.body;

    const exists = subscriptions.find(s => JSON.stringify(s) === JSON.stringify(sub));
    if (!exists) {
        subscriptions.push(sub);
    }

    res.json({ success: true });
}
