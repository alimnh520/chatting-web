import { connectDB } from "@/lib/connectDb";
import History from "@/models/History";
import Message from "@/models/Message";

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    try {
        const { newMessage } = req.body;
        const {
            conversationId,
            messageId,
            senderId,
            receiverId,
            text,
            file_url,
            file_id,
            seen,
            createdAt,
        } = newMessage;


        if (!conversationId || !messageId || !senderId || !receiverId) {
            return res.status(400).json({ success: false, message: "Missing fields" });
        }

        await connectDB();

        let conversation = await History.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            conversation = new History({
                participants: [senderId, receiverId],
                conversationId,
                unreadCount: {
                    [receiverId]: 1,
                    [senderId]: 0
                },
                lastMessage: text || (file_url ? "📷 Attachment" : ""),
                lastMessageAt: createdAt || new Date(),
                lastMessageSenderId: senderId,
            });

            // await conversation.save();
        } else {
            await History.updateOne(
                { _id: conversation._id },
                {
                    $set: {
                        lastMessage: text || (file_url ? "📷 Attachment" : ""),
                        lastMessageAt: createdAt || new Date(),
                        lastMessageSenderId: senderId,
                        [`unreadCount.${senderId}`]: 0
                    },
                    $inc: {
                        [`unreadCount.${receiverId}`]: 1,
                    },
                }
            );
        }


        const saveMessage = new Message({
            conversationId,
            messageId,
            senderId,
            receiverId,
            text,
            file_url,
            file_id,
            seen: seen || false,
            seenAt: seen ? new Date() : null,
            createdAt: createdAt || new Date(),
        });

        // await saveMessage.save();

        return res.status(200).json({
            success: true,
            saveMessage,
        });
    } catch (err) {
        console.error("SEND MESSAGE ERROR:", err);
        return res.status(500).json({ success: false });
    }
}
