import { connectDB } from "@/lib/connectDb";
import User from "@/models/User";
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
        await connectDB();

        const user = await User.findOne({ email }).select('password');

        if (!user || password !== user.password) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { user_id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        const isProduction = process.env.NODE_ENV === "production";

        const cookie = [
            `mychattingweb=${token}`,
            "Path=/",
            "HttpOnly",
            `Max-Age=86400`,
            isProduction ? "SameSite=None" : "SameSite=Lax",
            isProduction ? "Secure" : "",
        ].join("; ");

        res.setHeader("Set-Cookie", cookie);

        return res.status(200).json({
            success: true,
            message: "Login successful!",
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
