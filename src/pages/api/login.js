import { getCollection } from "@/lib/mongoclient";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const collection = await getCollection("user");
        const user = await collection.findOne({ email });

        if (!user || password !== user.password) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { user_id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Production environment
        const isProduction = process.env.NODE_ENV === "production";

        // Updated cookie
        res.setHeader(
            "Set-Cookie",
            `mychattingweb=${token}; Path=/; HttpOnly; SameSite=None; Max-Age=86400${isProduction ? "; Secure" : ""}`
        );

        return res.status(200).json({
            success: true,
            message: "Login successful!",
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
