import cloudinary from "@/cloudinary/cloudConfig";
import Message from "@/models/Message";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    try {
        const { msg, userId } = req.body;

        if (!msg || !userId) {
            return res.status(400).json({ success: false, message: "Missing parameters" });
        }

        if (msg.file_url && msg.file_id) {
            const fileInfo = await cloudinary.api.resource(msg.file_id);
            const type = fileInfo.resource_type;
            await cloudinary.uploader.destroy(msg.file_id.toString(), { resource_type: type });
        }

        await Message.deleteOne({
            messageId: msg.messageId,
            senderId: userId
        });

        return res.status(200).json({ success: true, message: "Message deleted" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}
