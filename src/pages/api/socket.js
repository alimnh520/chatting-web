import { Server } from "socket.io";
import { ObjectId } from "mongodb";
import User from "@/models/User";
import { sendPushNotification } from "./send-push";

export const config = {
    api: {
        bodyParser: false,
    },
};

const onlineUsers = new Map();

export default function handler(req, res) {
    if (!res.socket.server.io) {

        console.log("🟢 Socket server started");

        const io = new Server(res.socket.server, {
            path: "/api/socket",
            cors: {
                origin: "*",
            },
        });

        io.on("connection", (socket) => {

            socket.on("join", async ({ userId }) => {
                socket.userId = userId;
                socket.join(userId);
                onlineUsers.set(userId, socket.id);

                await User.updateOne(
                    { _id: new ObjectId(userId) },
                    { $set: { online: true, lastActiveAt: new Date() } }
                );

                io.emit("online-users", Array.from(onlineUsers.keys()));
            });


            socket.on("sendMessage", async ({ message }) => {
                io.to(message.receiverId).emit("receiveMessage", message);
                await sendPushNotification(message);
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


            //  CALL EVENTS
            socket.on("call-user", ({ from, to, type }) => {
                io.to(to).emit("incoming-call", { from, type });
            });

            socket.on("accept-call", ({ from, to }) => {
                io.to(to).emit("call-accepted", { from });
            });

            socket.on("reject-call", ({ from, to }) => {
                io.to(to).emit("call-rejected", { from });
            });
            socket.on("end-call", ({ from, to }) => {
                io.to(to).emit("call-ended", { from });
            });
            socket.on("call-offer", ({ to, offer, from }) => {
                io.to(to).emit("call-offer", { offer, from });
            });

            socket.on("call-answer", ({ to, answer }) => {
                io.to(to).emit("call-answer", { answer });
            });

            socket.on("disconnect", async () => {
                const entry = [...onlineUsers.entries()]
                    .find(([_, socketId]) => socketId === socket.id);

                if (entry) {
                    const [userId] = entry;
                    onlineUsers.delete(userId);

                    await User.updateOne(
                        { _id: new ObjectId(userId) },
                        {
                            $set: {
                                online: false,
                                lastActiveAt: new Date()
                            }
                        }
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
