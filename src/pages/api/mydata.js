import jwt from "jsonwebtoken";
import cookie from "cookie";
import User from "@/models/User";
import { connectDB } from "@/lib/connectDb";

export default async function handler(req, res) {
    const verifyToken = (req) => {
        if (!req.headers.cookie) return null;
        const cookies = cookie.parse(req.headers.cookie);
        const token = cookies['nahidhasanalimchattingweb'];
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
                await connectDB();
                const user = await User.findById(decodedUser.user_id).select("-password");
                return res.status(200).json({ success: true, user });
            } catch (error) {
                console.log(error)
                return res.status(500).json({ success: false, message: "Failed to fetch user" });
            }

        default:
            res.setHeader("Allow", ["GET", "POST"]);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
