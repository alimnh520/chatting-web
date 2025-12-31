import { getCollection } from "@/lib/mongoclient";
import { Server } from "socket.io";
import { ObjectId } from "mongodb";

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
                socket.join(userId);
                onlineUsers.set(userId, socket.id);

                const users = await getCollection("user");
                await users.updateOne(
                    { _id: new ObjectId(userId) },
                    {
                        $set: {
                            online: true,
                            lastActiveAt: new Date()
                        }
                    }
                );

                io.emit("online-users", Array.from(onlineUsers.keys()));
            });


            socket.on("sendMessage", ({ message }) => {
                io.to(message.receiverId).emit("receiveMessage", message);
            });

            socket.on("seenMessage", ({ conversationId, senderId }) => {
                io.to(senderId).emit("seenMessage", { conversationId });
            });

            // 📞 CALL EVENTS
            socket.on("call-user", ({ from, to, type }) => {
                io.to(to).emit("incoming-call", { from, type });
            });

            socket.on("accept-call", ({ from, to }) => {
                io.to(to).emit("call-accepted", { from });
            });

            socket.on("reject-call", ({ from, to }) => {
                io.to(to).emit("call-rejected", { from });
            });

            socket.on("disconnect", async () => {
                const entry = [...onlineUsers.entries()]
                    .find(([_, socketId]) => socketId === socket.id);

                if (entry) {
                    const [userId] = entry;
                    onlineUsers.delete(userId);

                    const users = await getCollection("user");
                    await users.updateOne(
                        { _id: new ObjectId(userId) },
                        {
                            $set: {
                                online: false,
                                lastActiveAt: new Date()
                            }
                        }
                    );

                    io.emit("online-users", Array.from(onlineUsers.keys()));
                }
            });


        });


        res.socket.server.io = io;
    }

    res.end();
}
