import { getCollection } from "@/lib/mongoclient";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
    if (req.method === "POST") {
        const { user_id } = req.body;
        if (!user_id) {
            return res.status(400).json({ success: false, message: "user_id is required" });
        }

        try {

            const convCol = await getCollection("conversations");
            const userCol = await getCollection("user");

            const conversations = await convCol
                .find({ participants: user_id })
                .sort({ lastMessageAt: -1 })
                .toArray();

            const history = await Promise.all(
                conversations.map(async (conv) => {
                    const otherUserId = conv.participants.find(id => id !== user_id);

                    const otherUser = await userCol.findOne(
                        { _id: new ObjectId(otherUserId) },
                        { projection: { password: 0 } }
                    );

                    return {
                        ...conv,
                        userId: otherUserId,
                        username: otherUser?.username,
                        image: otherUser?.image || null,
                        lastActiveAt: otherUser?.lastActiveAt || null
                    };
                })
            );
            res.status(200).json({ success: true, history });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Failed to fetch history" });
        }
    } else {
        res.status(405).json({ success: false, message: "Method not allowed" });
    }
}
