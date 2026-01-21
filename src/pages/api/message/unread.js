
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
    if (req.method === "PATCH") {
        const { conversationId, userId } = req.body;

        if (!conversationId || !userId) {
            return res.status(400).json({ success: false, message: "conversationId and userId required" });
        }

        try {
           
            return res.status(200).json({ success: true, modifiedCount: result.modifiedCount });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    } else {
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }
}
