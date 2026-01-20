import { connectDB } from "@/lib/connectDb";
import History from "@/models/History";
import Message from "@/models/Message";

export default async function handler(req, res) {

    if (req.method !== "POST") return res.status(405).end();

    try {
        const { newMessage } = req.body;

        const {
            senderId,
            receiverId,
            text,
            file_url,
            file_id,
            seen,
            createdAt,
        } = newMessage;

        await connectDB();

        let conversation = await History.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            conversation = new History({
                participants: [senderId, receiverId],
                unreadCount: { [receiverId]: 0 },
                createdAt: new Date(),
            });
            await conversation.save();
        }

        const saveMessage = new Message({
            conversationId: conversation._id,
            senderId,
            receiverId,
            text,
            file_url,
            file_id,
            seen: seen || false,
            seenAt: seen ? new Date() : null,
            createdAt,
        });
        await saveMessage.save();

        await History.updateOne(
            { _id: conversation._id },
            {
                $set: {
                    lastMessage: text || "📷 Image",
                    lastMessageAt: new Date(),
                    lastMessageSenderId: senderId,
                },
                $inc: {
                    [`unreadCount.${receiverId}`]: 1,
                },
            }
        );

        return res.status(200).json({ success: true, message: 'success' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false });
    }
}
