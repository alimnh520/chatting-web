'use client';

import { FaPhoneSlash, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";
import { useState } from "react";

export default function CallScreen({
    user,
    callType = "audio", // "audio" | "video"
    onEnd,
    setIsAudio
}) {
    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(callType === "video");

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] flex items-center justify-center text-white">

            <div className="w-full max-w-md h-full sm:h-auto sm:rounded-2xl bg-black/40 backdrop-blur-lg flex flex-col items-center justify-between p-6">

                {/* User Info */}
                <div className="flex flex-col items-center mt-10">
                    <img
                        src={user?.image}
                        alt={user?.username}
                        className="w-28 h-28 rounded-full object-cover border-4 border-white/20"
                    />
                    <h2 className="mt-4 text-xl font-semibold">
                        {user?.username}
                    </h2>
                    <p className="text-sm text-gray-300 mt-1">
                        {callType === "video" ? "Video call" : "Audio call"} • Ringing…
                    </p>
                </div>

                {/* Video Preview (optional) */}
                {callType === "video" && (
                    <div className="w-full h-48 bg-black rounded-xl overflow-hidden mt-6">
                        <video
                            className="w-full h-full object-cover"
                            autoPlay
                            muted
                        />
                    </div>
                )}

                {/* Controls */}
                <div className="flex items-center justify-center gap-6 mb-10">

                    {/* Mic */}
                    <button
                        onClick={() => setMicOn(!micOn)}
                        className={`w-14 h-14 rounded-full flex items-center justify-center 
                        ${micOn ? "bg-white/20" : "bg-red-600"}`}
                    >
                        {micOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
                    </button>

                    <button
                        onClick={() => {
                            socketRef.current.emit("end-call", {
                                from: user._id,
                                to: user.userId
                            });
                            setIsAudio(false);
                        }}
                        className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center"
                    >
                        <FaPhoneSlash size={24} />
                    </button>

                    {/* Video */}
                    {callType === "video" && (
                        <button
                            onClick={() => setVideoOn(!videoOn)}
                            className={`w-14 h-14 rounded-full flex items-center justify-center 
                            ${videoOn ? "bg-white/20" : "bg-red-600"}`}
                        >
                            {videoOn ? <FaVideo size={20} /> : <FaVideoSlash size={20} />}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
