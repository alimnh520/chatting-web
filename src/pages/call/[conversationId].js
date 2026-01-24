'use client';

import { useEffect, useRef, useContext } from "react";
import { useRouter } from "next/router";
import { io } from "socket.io-client";
import { UserContext } from "../Provider";

export default function CallPage() {
    const { user } = useContext(UserContext);
    const router = useRouter();
    const { conversationId } = router.query;

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!user?._id || !conversationId) return;

        // 1️⃣ Connect socket
        socketRef.current = io({ path: "/api/socket" });
        socketRef.current.emit("join-call-room", { conversationId, userId: user._id });

        const initCall = async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localVideoRef.current.srcObject = stream;

            const pc = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });
            peerRef.current = pc;

            // Add local tracks
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            // Remote stream
            pc.ontrack = e => remoteVideoRef.current.srcObject = e.streams[0];

            // ICE candidate
            pc.onicecandidate = e => {
                if (e.candidate) {
                    socketRef.current.emit("ice-candidate", { conversationId, candidate: e.candidate, from: user._id });
                }
            };

            // Listen for offer
            socketRef.current.on("call-offer", async ({ offer, from }) => {
                await pc.setRemoteDescription(offer);
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socketRef.current.emit("call-answer", { conversationId, answer, from });
            });

            // Listen for answer
            socketRef.current.on("call-answer", async ({ answer }) => {
                await pc.setRemoteDescription(answer);
            });

            // Listen ICE candidates
            socketRef.current.on("ice-candidate", async ({ candidate }) => {
                if (candidate) await pc.addIceCandidate(candidate);
            });

            // Listen end call
            socketRef.current.on("call-ended", () => {
                endCall();
            });

            // If caller, create offer
            if (router.query.caller === "true") {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socketRef.current.emit("call-offer", { conversationId, offer, from: user._id });
            }
        };

        initCall();

        return () => {
            endCall();
        };
    }, [user?._id, conversationId]);

    const endCall = () => {
        peerRef.current?.close();
        socketRef.current?.emit("end-call", { conversationId });
        router.back();
    };

    return (
        <div className="h-screen w-full flex flex-col bg-black">
            <video ref={remoteVideoRef} autoPlay playsInline className="flex-1 w-full object-cover" />
            <video ref={localVideoRef} autoPlay muted playsInline className="absolute w-40 h-40 bottom-4 right-4 object-cover rounded-lg border-2 border-white" />
            <button
                className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-red-600 px-6 py-3 rounded-full text-white"
                onClick={endCall}
            >
                End Call
            </button>
        </div>
    );
}
