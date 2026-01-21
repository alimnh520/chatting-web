import { getCollection } from "@/lib/mongoclient";
import History from "@/models/History";
import Message from "@/models/Message";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ success: false });

    const { conversationId, userId } = req.body;
    if (!conversationId || !userId) return res.status(400).json({ success: false });

    try {
        await Message.updateMany(
            {
                conversationId: new ObjectId(conversationId),
                receiverId: userId,
                seen: false,
            },
            { $set: { seen: true, seenAt: new Date() } }
        );

        await History.updateOne(
            { _id: new ObjectId(conversationId) },
            { $set: { [`unreadCount.${userId}`]: 0 } }
        );


        res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
}
