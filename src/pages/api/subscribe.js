import { connectDB } from "@/lib/connectDb";
import PushSubscription from "@/models/PushSubscription";

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    await connectDB();
    const { userId, subscription } = req.body;

    await PushSubscription.deleteMany({ userId });

    await PushSubscription.create({ userId, subscription });

    res.json({ success: true });
}
