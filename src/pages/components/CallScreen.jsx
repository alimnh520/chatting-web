'use client';

import { useEffect, useRef, useState } from "react";
import { FaPhoneSlash, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

export default function CallScreen({ user, socketRef, setIsAudio, onEnd, isCaller }) {
    const peerRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const timerRef = useRef(null);

    const [micOn, setMicOn] = useState(true);
    const [status, setStatus] = useState("Ringing…");
    const [callTime, setCallTime] = useState(0);

    const startTimer = () => {
        if (!timerRef.current) {
            timerRef.current = setInterval(() => {
                setCallTime(t => t + 1);
            }, 1000);
        }
    };

    // 🔹 Create peer + local stream (both sides)
    useEffect(() => {
        const init = async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = stream;

            const pc = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });

            peerRef.current = pc;

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            pc.ontrack = (e) => {
                remoteAudioRef.current.srcObject = e.streams[0];
                setStatus("Connected");
                startTimer();
            };

            pc.onicecandidate = (e) => {
                if (e.candidate) {
                    socketRef.current.emit("ice-candidate", {
                        to: user.userId,
                        candidate: e.candidate
                    });
                }
            };

            // ✅ ONLY caller creates offer
            if (isCaller) {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socketRef.current.emit("call-offer", {
                    to: user.userId,
                    from: user._id,
                    offer
                });
            }
        };

        init();

        return () => {
            peerRef.current?.close();
            localStreamRef.current?.getTracks().forEach(t => t.stop());
            clearInterval(timerRef.current);
        };
    }, []);

    // 🔹 Signaling
    useEffect(() => {
        const socket = socketRef.current;

        socket.on("call-offer", async ({ offer, from }) => {
            await peerRef.current.setRemoteDescription(offer);
            const answer = await peerRef.current.createAnswer();
            await peerRef.current.setLocalDescription(answer);
            socket.emit("call-answer", { to: from, answer });
        });

        socket.on("call-answer", async ({ answer }) => {
            await peerRef.current.setRemoteDescription(answer);
            setStatus("Connected");
            startTimer();
        });

        socket.on("ice-candidate", ({ candidate }) => {
            peerRef.current.addIceCandidate(candidate);
        });

        socket.on("call-ended", () => {
            setIsAudio(false);
            onEnd();
        });

        return () => {
            socket.off("call-offer");
            socket.off("call-answer");
            socket.off("ice-candidate");
            socket.off("call-ended");
        };
    }, []);

    const toggleMic = () => {
        const track = localStreamRef.current?.getAudioTracks()[0];
        if (track) {
            track.enabled = !micOn;
            setMicOn(!micOn);
        }
    };

    const endCall = () => {
        socketRef.current.emit("end-call", { to: user.userId });
        setIsAudio(false);
        onEnd();
    };

    const format = (s) =>
        `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center text-white">
            <div className="bg-gray-900 p-6 rounded-xl w-80 text-center">
                <h2>{user.username}</h2>
                <p>{status} {status === "Connected" && format(callTime)}</p>

                <div className="flex justify-center gap-6 mt-6">
                    <button onClick={toggleMic}>
                        {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                    </button>
                    <button onClick={endCall}><FaPhoneSlash /></button>
                </div>
            </div>
            <audio ref={remoteAudioRef} autoPlay />
        </div>
    );
}
