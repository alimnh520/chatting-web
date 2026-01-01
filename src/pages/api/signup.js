import { connectDB } from "@/lib/connectDb";
import { getCollection } from "@/lib/mongoclient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const { username, email, password, imageUrl, imageId } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "সব ফিল্ড আবশ্যক" });
        }

        await connectDB();
        const collection = await getCollection("user");

        const existingUser = await collection.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "এই ইমেইল আগে থেকেই আছে" });
        }

        // 🔐 password hash করা (strongly recommended)
        // const hashedPassword = await bcrypt.hash(password, 10);

        const result = await collection.insertOne({
            username,
            email,
            password,
            image: imageUrl || "",
            imageId: imageId || "",
            createdAt: new Date(),
        });

        const token = jwt.sign(
            { user_id: result.insertedId },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        const isProduction = process.env.NODE_ENV === "production";

        const cookie = [
            `mychattingweb=${token}`,
            "Path=/",
            "HttpOnly",
            "Max-Age=86400",
            isProduction ? "SameSite=None" : "SameSite=Lax",
            isProduction ? "Secure" : "",
        ].join("; ");

        res.setHeader("Set-Cookie", cookie);

        return res.status(201).json({
            success: true,
            message: "একাউন্ট তৈরি সফল",
        });

    } catch (err) {
        console.error("Signup Error:", err);
        return res.status(500).json({ message: "সার্ভার এরর" });
    }
}
