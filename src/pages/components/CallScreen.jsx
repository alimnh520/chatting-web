'use client';

import { useEffect, useRef, useState } from "react";
import { FaPhoneSlash, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

export default function CallScreen({
    user,          // যাকে কল করা হচ্ছে
    socketRef,
    setIsAudio,
    onEnd
}) {
    const peerRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteAudioRef = useRef(null);

    const [micOn, setMicOn] = useState(true);
    const [status, setStatus] = useState("Ringing…");

    useEffect(() => {
        const init = async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = stream;

            peerRef.current = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });

            stream.getTracks().forEach(track =>
                peerRef.current.addTrack(track, stream)
            );

            peerRef.current.ontrack = (e) => {
                remoteAudioRef.current.srcObject = e.streams[0];
                setStatus("Connected");
            };

            peerRef.current.onicecandidate = (e) => {
                if (e.candidate) {
                    socketRef.current.emit("ice-candidate", {
                        to: user.userId,
                        candidate: e.candidate
                    });
                }
            };
        };

        init();

        return () => {
            localStreamRef.current?.getTracks().forEach(t => t.stop());
            peerRef.current?.close();
        };
    }, []);

    // 🔹 Socket signalling
    useEffect(() => {
        socketRef.current.on("call-offer", async ({ offer, from }) => {
            await peerRef.current.setRemoteDescription(offer);

            const answer = await peerRef.current.createAnswer();
            await peerRef.current.setLocalDescription(answer);

            socketRef.current.emit("call-answer", {
                to: from,
                answer
            });
        });

        socketRef.current.on("call-answer", async ({ answer }) => {
            await peerRef.current.setRemoteDescription(answer);
        });

        socketRef.current.on("ice-candidate", async ({ candidate }) => {
            await peerRef.current.addIceCandidate(candidate);
        });

        socketRef.current.on("call-ended", endCall);

        return () => {
            socketRef.current.off("call-offer");
            socketRef.current.off("call-answer");
            socketRef.current.off("ice-candidate");
            socketRef.current.off("call-ended");
        };
    }, []);

    const endCall = () => {
        setIsAudio(false);
        onEnd();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center text-white">
            <div className="bg-gray-900 p-6 rounded-xl w-80 text-center">

                <img
                    src={user.image}
                    className="w-24 h-24 rounded-full mx-auto"
                />

                <h2 className="mt-3 font-semibold">{user.username}</h2>
                <p className="text-sm text-gray-400">{status}</p>

                <div className="flex justify-center gap-6 mt-6">
                    <button
                        onClick={() => {
                            localStreamRef.current
                                .getAudioTracks()[0].enabled = !micOn;
                            setMicOn(!micOn);
                        }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center 
                        ${micOn ? "bg-gray-700" : "bg-red-600"}`}
                    >
                        {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                    </button>

                    <button
                        onClick={() => {
                            socketRef.current.emit("end-call", {
                                to: user.userId
                            });
                            endCall();
                        }}
                        className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center"
                    >
                        <FaPhoneSlash />
                    </button>
                </div>
            </div>

            <audio ref={remoteAudioRef} autoPlay />
        </div>
    );
}
