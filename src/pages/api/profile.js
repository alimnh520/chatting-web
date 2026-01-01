import cloudinary from "@/cloudinary/cloudConfig";
import { getCollection } from "@/lib/mongoclient";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
    if (req.method === "PATCH") {
        try {
            const { userId, username, email, password, imageUrl, imageId, deleteId } = req.body;

            if (!userId) {
                return res.status(400).json({ success: false, message: "User ID is required" });
            }

            const userProfile = await getCollection("user");

            if (deleteId) {
                await cloudinary.uploader.destroy(deleteId.toString(), { resource_type: "image" });
            }

            const updateData = {};
            if (username) updateData.username = username;
            if (email) updateData.email = email;
            if (password) updateData.password = password;
            if (imageUrl) updateData.image = imageUrl;
            if (imageId) updateData.imageId = imageId;

            if (Object.keys(updateData).length > 0) {
                await userProfile.updateOne(
                    { _id: new ObjectId(userId) },
                    { $set: updateData }
                );
            }

            return res.status(200).json({ success: true, message: "Profile updated successfully" });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    } else {
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }
}
