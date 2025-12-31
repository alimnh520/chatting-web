import { getCollection } from "@/lib/mongoclient";

export default async function handler(req, res) {

    if (req.method === "GET") {
        try {
            const collection = await getCollection("user");

            const users = await collection
                .find({}, { projection: { password: 0 } })
                .sort({ createdAt: -1 })
                .toArray();

            return res.status(200).json({
                success: true,
                users
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch users"
            });
        }
    }
}
