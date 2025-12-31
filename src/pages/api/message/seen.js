import { getCollection } from "@/lib/mongoclient";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ success: false });

    const { conversationId, userId } = req.body;
    if (!conversationId || !userId) return res.status(400).json({ success: false });

    try {
        const convId = new ObjectId(conversationId);
        const messageCol = await getCollection("messages");

        await messageCol.updateMany(
            { conversationId: convId, receiverId: userId, seen: false },
            { $set: { seen: true, seenAt: new Date() } }
        );

        // Emit seen info to sender
        if (global.io) {
            global.io.to(conversationId).emit("messagesSeen", { conversationId });
        }

        res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
}
