import { subscriptions } from './sharedSubscriptions';

export default function handler(req, res) {
    if (req.method === "POST") {
        const subscription = req.body;
        subscriptions.push(subscription);
        res.status(201).json({ message: "Subscribed!" });
    }
}
