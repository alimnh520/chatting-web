import webpush from "web-push";
import PushSubscription from "@/models/PushSubscription";
import { connectDB } from "@/lib/connectDb";

webpush.setVapidDetails(
    "mailto:test@test.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    const { toUserId, title, body, icon } = req.body;

    await connectDB();

    const sub = await PushSubscription.findOne({ userId: toUserId });
    if (!sub) return res.json({ success: false, message: "User not subscribed" });

    const payload = JSON.stringify({
        title,
        body,
        icon,
        url: "/"
    });

    await webpush.sendNotification(sub.subscription, payload);

    res.json({ success: true });
}
