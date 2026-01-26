export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const isProduction = process.env.NODE_ENV === "production";

        const cookie = [
            "nahidhasanalimchattingweb=",
            "Path=/",
            "HttpOnly",
            "Max-Age=0",
            isProduction ? "SameSite=None" : "SameSite=Lax",
            isProduction ? "Secure" : "",
        ].join("; ");

        res.setHeader("Set-Cookie", cookie);

        return res.status(200).json({
            success: true,
            message: "Logout successful",
        });

    } catch (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}
