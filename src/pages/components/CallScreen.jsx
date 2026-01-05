'use client';

import { useEffect, useRef, useState } from "react";
import { FaPhoneSlash, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

export default function CallScreen({ user, socketRef, setIsAudio, onEnd }) {
    const peerRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteAudioRef = useRef(null);

    const [micOn, setMicOn] = useState(true);
    const [status, setStatus] = useState("Ringing…");
    const [callTime, setCallTime] = useState(0);
    const timerRef = useRef(null);

    if (!user) return null;

    // Init peer connection & local stream
    useEffect(() => {
        const init = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                localStreamRef.current = stream;

                peerRef.current = new RTCPeerConnection({
                    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
                });

                // Add local tracks
                stream.getTracks().forEach(track => peerRef.current.addTrack(track, stream));

                // Caller + Receiver remote track handle
                peerRef.current.ontrack = (e) => {
                    if (remoteAudioRef.current) {
                        remoteAudioRef.current.srcObject = e.streams[0];
                        setStatus("Connected");

                        if (!timerRef.current) {
                            timerRef.current = setInterval(() => setCallTime(prev => prev + 1), 1000);
                        }
                    }
                };

                peerRef.current.onicecandidate = (e) => {
                    if (e.candidate && socketRef.current) {
                        socketRef.current.emit("ice-candidate", { to: user.userId, candidate: e.candidate });
                    }
                };

                // Caller sends offer
                const offer = await peerRef.current.createOffer();
                await peerRef.current.setLocalDescription(offer);

                socketRef.current?.emit("call-offer", {
                    to: user.userId,
                    from: user._id,
                    offer
                });

            } catch (err) {
                console.error("Call init error:", err);
            }
        };

        init();

        return () => {
            localStreamRef.current?.getTracks().forEach(t => t.stop());
            peerRef.current?.close();
            clearInterval(timerRef.current);
        };
    }, [socketRef, user]);

    // Audio autoplay
    useEffect(() => {
        if (remoteAudioRef.current) {
            remoteAudioRef.current.autoplay = true;
            remoteAudioRef.current.volume = 1.0;
        }
    }, []);

    // Socket events
    useEffect(() => {
        if (!socketRef.current) return;

        const handleCallOffer = async ({ offer, from }) => {
            await peerRef.current.setRemoteDescription(offer);
            const answer = await peerRef.current.createAnswer();
            await peerRef.current.setLocalDescription(answer);
            socketRef.current.emit("call-answer", { to: from, answer });
        };

        const handleCallAnswer = async ({ answer }) => {
            await peerRef.current.setRemoteDescription(answer);
            setStatus("Connected");

            if (!timerRef.current) {
                timerRef.current = setInterval(() => setCallTime(prev => prev + 1), 1000);
            }
        };

        const handleIceCandidate = async ({ candidate }) => {
            await peerRef.current.addIceCandidate(candidate);
        };

        const handleCallEnded = () => {
            clearInterval(timerRef.current);
            setIsAudio(false);
            onEnd();
        };

        socketRef.current.on("call-offer", handleCallOffer);
        socketRef.current.on("call-answer", handleCallAnswer);
        socketRef.current.on("ice-candidate", handleIceCandidate);
        socketRef.current.on("call-ended", handleCallEnded);

        return () => {
            socketRef.current.off("call-offer", handleCallOffer);
            socketRef.current.off("call-answer", handleCallAnswer);
            socketRef.current.off("ice-candidate", handleIceCandidate);
            socketRef.current.off("call-ended", handleCallEnded);
        };
    }, [socketRef, onEnd]);

    const toggleMic = () => {
        if (localStreamRef.current) {
            const track = localStreamRef.current.getAudioTracks()[0];
            if (track) track.enabled = !micOn;
            setMicOn(!micOn);
        }
    };

    const endCall = () => {
        socketRef.current?.emit("end-call", { to: user.userId });
        localStreamRef.current?.getTracks().forEach(t => t.stop());
        peerRef.current?.close();
        clearInterval(timerRef.current);
        setIsAudio(false);
        onEnd();
    };

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60).toString().padStart(2, "0");
        const s = (sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center text-white">
            <div className="bg-gray-900 p-6 rounded-xl w-80 text-center">
                <img src={user?.image || "/avatar.png"} alt={user?.username || "User"} className="w-24 h-24 rounded-full mx-auto" />
                <h2 className="mt-3 font-semibold">{user?.username || "Unknown"}</h2>
                <p className="text-sm text-gray-400">
                    {status} {status === "Connected" && `| ${formatTime(callTime)}`}
                </p>
                <div className="flex justify-center gap-6 mt-6">
                    <button
                        onClick={toggleMic}
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${micOn ? "bg-gray-700" : "bg-red-600"}`}
                    >
                        {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                    </button>
                    <button
                        onClick={endCall}
                        className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center"
                    >
                        <FaPhoneSlash />
                    </button>
                </div>
            </div>
            <audio ref={remoteAudioRef} autoPlay playsInline volume={1.0} />
        </div>
    );
}
