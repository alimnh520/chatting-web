import { subscriptions } from "./sharedSubscriptions";

export default function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    const subscription = req.body;

    const exists = subscriptions.find(
        s => JSON.stringify(s) === JSON.stringify(subscription)
    );

    if (!exists) {
        subscriptions.push(subscription);
    }

    console.log("Total subs:", subscriptions.length);

    res.status(201).json({ success: true });
}
