import { getCollection } from "@/lib/mongoclient";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const { id } = req.body;

            if (!id) {
                return res.status(400).json({ success: false, message: "User ID is required" });
            }

            const collection = await getCollection("user");

            const user = await collection.findOne({ _id: new ObjectId(id) });

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            return res.status(200).json({
                success: true,
                location: user.location || null
            });

        } catch (error) {
            console.error("Error fetching location:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch location"
            });
        }
    } else {
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }
}
