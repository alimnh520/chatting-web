import { getCollection } from "@/lib/mongoclient";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const { conversationId } = req.body;

            if (!conversationId) {
                return res.status(400).json({ success: false, message: "conversationId is required" });
            }

            const messageCol = await getCollection("messages");

            const messages = await messageCol
                .find({ conversationId: new ObjectId(conversationId) })
                .sort({ createdAt: 1 })
                .toArray();

            return res.status(200).json({
                success: true,
                messages
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false });
        }
    }
}
