import { useEffect, useState } from "react";
import { io } from "socket.io-client";

let socket;

export default function ChatPage() {
    const [userId, setUserId] = useState("user1");
    const [receiverId, setReceiverId] = useState("");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        
        fetch("/api/socket");

        socket = io({
            path: "/api/socket",
        });

        socket.on("connect", () => {
            console.log("Connected:", socket.id);
            socket.emit("join", { userId });
        });

        socket.on("receiveMessage", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            socket.disconnect();
        };
    }, [userId]);

    const sendMessage = () => {
        if (!receiverId || !message) return;
        socket.emit("sendMessage", { senderId: userId, receiverId, text: message });
        setMessages((prev) => [...prev, { senderId: userId, text: message }]);
        setMessage("");
    };

    return (
        <div style={{ padding: "20px" }} className="bg-gray-500">
            <h2>Chat</h2>

            <input
                type="text"
                placeholder="Receiver ID"
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                style={{ marginRight: "10px" }}
            />
            <input
                type="text"
                placeholder="Type message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>

            <div style={{ marginTop: "20px" }}>
                <h3>Messages:</h3>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{ marginBottom: "10px" }}>
                        <b>{msg.senderId === userId ? "You" : msg.senderId}:</b> {msg.text}
                    </div>
                ))}
            </div>
        </div>
    );
}
