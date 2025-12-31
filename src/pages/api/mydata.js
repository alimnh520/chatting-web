import jwt from "jsonwebtoken";
import { getCollection } from "@/lib/mongoclient";
import { ObjectId } from "mongodb";
import cookie from "cookie";

export default async function handler(req, res) {
    const verifyToken = (req) => {
        if (!req.headers.cookie) return null;
        const cookies = cookie.parse(req.headers.cookie);
        const token = cookies['mychattingweb'];
        if (!token) return null;
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch {
            return null;
        }
    };

    const decodedUser = verifyToken(req);
    if (!decodedUser) return res.status(401).json({ error: "Unauthorized or invalid token" });

    switch (req.method) {
        case "GET":
            try {
                const collection = await getCollection("user");
                const user = await collection.findOne(
                    { _id: new ObjectId(decodedUser.user_id) },
                    { projection: { password: 0 } }
                );
                return res.status(200).json({ success: true, user });
            } catch (error) {
                return res.status(500).json({ success: false, message: "Failed to fetch user" });
            }

        case "POST":
            try {
                const { location } = req.body;
                const collection = await getCollection("user");
                await collection.updateOne(
                    { _id: new ObjectId(decodedUser.user_id) },
                    { $set: { location } }
                );

                return res.status(200).json({ success: true, message: "Location updated" });
            } catch (error) {
                return res.status(500).json({ success: false, message: "Failed to update location" });
            }

        default:
            res.setHeader("Allow", ["GET", "POST"]);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
