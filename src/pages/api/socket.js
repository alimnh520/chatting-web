import { Server } from "socket.io";
import User from "@/models/User";
import { connectDB } from "@/lib/connectDb";

export const config = {
    api: {
        bodyParser: false,
    },
};

const onlineUsers = new Map();

export default async function handler(req, res) {
    await connectDB();
    if (!res.socket.server.io) {

        console.log("🟢 Socket server started");

        const io = new Server(res.socket.server, {
            path: "/api/socket",
            cors: {
                origin: "*",
            },
        });

        const onlineSockets = {};

        io.on("connection", (socket) => {

            socket.on("join", async ({ userId }) => {
                socket.userId = userId;
                socket.join(userId);
                onlineUsers.set(userId, socket.id);
                onlineSockets[userId] = socket;

                await User.updateOne(
                    { _id: userId },
                    { $set: { online: true, lastActiveAt: new Date() } }
                );

                io.emit("online-users", Array.from(onlineUsers.keys()));
            });

            socket.on("sendMessage", ({ message }) => {
                io.to(message.receiverId).emit("receiveMessage", message);
            });

            socket.on("seenMessage", ({ conversationId, senderId }) => {
                io.to(senderId).emit("seenMessage", { conversationId });
            });

            socket.on("deleteMessage", ({ messageId, conversationId, participants }) => {
                participants.forEach(userId => {
                    if (userId !== socket.userId) {
                        io.to(userId).emit("messageDeleted", { messageId, conversationId });
                    }
                });
            });

            socket.on("typing", ({ from, to }) => {
                io.to(to).emit("user-typing", { from });
            });

            socket.on("stop-typing", ({ from, to }) => {
                io.to(to).emit("user-stop-typing", { from });
            });

            // notification events can be added here

            socket.on("disconnect", async () => {
                const entry = [...onlineUsers.entries()].find(([_, socketId]) => socketId === socket.id);
                if (entry) {
                    const [userId] = entry;
                    onlineUsers.delete(userId);
                    delete onlineSockets[userId];

                    await User.updateOne(
                        { _id: userId },
                        { $set: { online: false, lastActiveAt: new Date() } }
                    );

                    io.emit("online-users", Array.from(onlineUsers.keys()));
                    io.emit("user-stop-typing", { from: userId });
                }
            });

        });


        res.socket.server.io = io;
    }

    res.end();
}
