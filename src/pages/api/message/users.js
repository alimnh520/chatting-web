import User from "@/models/User";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    try {
        const users = await User
            .find({})
            .select("-password")
            .sort({ lastActiveAt: -1 });

        return res.status(200).json({
            success: true,
            users
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
}
