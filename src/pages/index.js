'use client';

import { useContext, useEffect, useRef, useState } from "react";
import moment from "moment";
import { IoIosArrowBack } from "react-icons/io";
import { ImCross } from "react-icons/im";
import { FaImage } from "react-icons/fa";
import Link from "next/link";
import { FaHeart } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import { IoVideocam } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import { FaCopy } from "react-icons/fa";
import { io } from "socket.io-client";
import { UserContext } from "./Provider";

export default function Chat() {
  const { user } = useContext(UserContext);
  const [allUser, setAllUser] = useState([]);
  const [history, setHistory] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadMessages, setLoadMessages] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isSearch, setIsSearch] = useState(false);
  const [fullView, setFullView] = useState(true);
  const [mobileView, setMobileView] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [deleteBtn, setDeleteBtn] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState(false);
  const [msgId, setMsgId] = useState('');
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const messagesCache = useRef({});
  const longPressTimer = useRef(null);
  const ignoreNextClick = useRef(false);

  // call events // call events // call events // call events // call events // call events // call events // call events

  const pendingCandidates = useRef([]);

  const [incomingCall, setIncomingCall] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [calling, setCalling] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);

  // useState হুকস এ যোগ করুন:
  const [showLocalVideo, setShowLocalVideo] = useState(true);
  const [showRemoteVideo, setShowRemoteVideo] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // call events useEffect এ যোগ করুন:
  useEffect(() => {
    // যখন remote stream আসে
    if (remoteStream) {
      console.log("🌐 Remote stream updated:", remoteStream);
      setShowRemoteVideo(true);

      // ভিডিও প্লে করার চেষ্টা করুন
      setTimeout(() => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.play()
            .then(() => console.log("✅ Remote video playing"))
            .catch(err => console.error("❌ Remote video play error:", err));
        }
      }, 500);
    }
  }, [remoteStream]);

  // যখন local stream আসে
  useEffect(() => {
    if (stream) {
      console.log("📱 Local stream updated:", stream);
      setShowLocalVideo(true);
    }
  }, [stream]);


  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!mobileView) {
      const handlePopState = (e) => {
        e.preventDefault();
        setChatUser(null);
        setMobileView(true);
      };

      window.addEventListener("popstate", handlePopState);

      window.history.pushState(null, document.title, window.location.href);

      return () => window.removeEventListener("popstate", handlePopState);
    }

  }, [mobileView]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const mobile = window.innerWidth < 660;
      setIsMobile(mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);


  // notification permission   // notification permission  // notification permission  // notification permission  // notification permission



  // socket events // socket events// socket events// socket events// socket events// socket events// socket events// socket events// socket events

  useEffect(() => {
    if (!user?._id) return;

    socketRef.current = io({ path: "/api/socket" });

    socketRef.current.emit("join", { userId: user._id });

    socketRef.current.on("receiveMessage", (msg) => {
      if (chatUser?.conversationId === msg.conversationId) {
        setMessages(prev => {
          const updated = [...prev, msg];
          messagesCache.current[msg.conversationId] = updated;
          return updated;
        });
      }
      updateMessage(msg);
    });



    socketRef.current.on("seenMessage", ({ conversationId }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.conversationId === conversationId && msg.senderId === user._id
            ? { ...msg, seen: true }
            : msg
        )
      );
    });

    socketRef.current.on("messageDeleted", ({ messageId }) => {
      setMessages(prev => prev.filter(m => m.messageId !== messageId));
    });


    socketRef.current.on("user-typing", ({ from }) => {
      if (chatUser && from === chatUser.userId) {
        setIsTyping(true);
      }
    });

    socketRef.current.on("user-stop-typing", ({ from }) => {
      if (chatUser && from === chatUser.userId) {
        setIsTyping(false);
      }
    });

    socketRef.current.on("online-users", (users) => {
      setOnlineUsers(users);
    });

    // call events  // call events // call events // call events // call events // call events // call events // call events

    socketRef.current.on("incoming-call", ({ from, offer }) => {
      console.log("📞 Incoming call from:", from);
      setIncomingCall({ from, offer });
    });

    socketRef.current.on("call-answered", async ({ answer }) => {
      console.log("📞 Call answered with answer:", answer);

      if (!peerRef.current) {
        console.error("❌ peerRef missing when receiving answer");
        return;
      }

      try {
        const remoteDesc = new RTCSessionDescription(answer);
        await peerRef.current.setRemoteDescription(remoteDesc);
        setCallAccepted(true);
        console.log("✅ Remote description set successfully");
      } catch (error) {
        console.error("Error setting remote description:", error);
      }
    });

    socketRef.current.on("ice-candidate", async ({ from, candidate }) => {
      console.log("📥 Received ICE candidate from:", from);

      if (!candidate) {
        console.log("No candidate received");
        return;
      }

      try {
        if (peerRef.current && peerRef.current.remoteDescription) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("✅ ICE candidate added successfully");
        } else {
          console.log("📦 Storing pending ICE candidate");
          pendingCandidates.current.push(candidate);
        }
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    });



    socketRef.current.on("call-ended", () => {
      endCallCleanup();
    });


    return () => {
      socketRef.current.off("messageDeleted");
      socketRef.current.off("user-typing");
      socketRef.current.off("user-stop-typing");
      socketRef.current.disconnect();
      socketRef.current = null;
    };

  }, [user?._id, chatUser?.conversationId]);


  const updateMessage = (msg) => {
    const isMe = msg.senderId === user._id;
    const otherUserId = isMe ? msg.receiverId : msg.senderId;

    setHistory(prev => {
      const prevList = Array.isArray(prev) ? [...prev] : [];
      const index = prevList.findIndex(h =>
        h.participants?.includes(msg.senderId) &&
        h.participants?.includes(msg.receiverId)
      );

      if (index !== -1) {
        const old = prevList[index];
        const updatedConv = {
          ...old,
          lastMessage: msg.text || (msg.file_url ? "📷 Image/Video" : "📷 File"),
          lastMessageAt: new Date(),
          lastMessageSenderId: msg.senderId,
          unreadCount: {
            ...old.unreadCount,
            [user._id]: chatUser?.conversationId === msg.conversationId ? 0 : (old.unreadCount?.[user._id] || 0) + 1
          },
        };
        prevList.splice(index, 1);
        return [updatedConv, ...prevList];
      }
      // নতুন conversation
      const newConv = {
        _id: Date.now().toString(),
        conversationId: msg.conversationId || Date.now().toString(),
        participants: [msg.senderId, msg.receiverId],
        userId: otherUserId,
        username: "Unknown",
        image: "/avatar.png",
        lastMessage: msg.text || (msg.file_url ? "📷 Image/Video" : "📷 File"),
        lastMessageAt: new Date(),
        lastMessageSenderId: msg.senderId,
        unreadCount: {
          [user._id]: isMe ? 0 : 1,
        },
      };
      return [newConv, ...prevList];
    });
  };



  const handleSendMessage = async (customText = null) => {

    const messageText = customText ?? input;
    if (!messageText && !file) return;

    if (file) {
      const MAX_SIZE = 20 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        alert("File size must be less than 20MB");
        return;
      }
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "video/mp4",
        "video/webm",
        "video/quicktime"
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Only image and video files are allowed");
        return;
      }
    }

    let file_url = null;
    let file_id = null;

    if (file) {

      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "form-submit");
      formData.append("folder", "user");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/auto/upload`,
        { method: "POST", body: formData }
      );

      const uploadResult = await response.json();
      setIsUploading(false);

      if (!uploadResult.secure_url) {
        alert("Upload failed");
        return;
      }

      file_url = uploadResult.secure_url;
      file_id = uploadResult.public_id;
    }

    const optimisticMessage = {
      _id: Date.now().toString(),
      conversationId: chatUser.conversationId,
      messageId: Date.now().toString(),
      senderId: user._id,
      receiverId: chatUser?.userId,
      text: messageText,
      file_url,
      file_id,
      file_type: '',
      seen: false,
      createdAt: new Date(),
    };

    setInput("");
    setFile(null);

    setMessages(prev => [...prev, optimisticMessage]);

    const convId = chatUser.conversationId;
    const existingCache = messagesCache.current[convId] || [];
    const isDuplicate = existingCache.some(m => m.messageId === optimisticMessage.messageId);
    if (!isDuplicate) {
      messagesCache.current[convId] = [...existingCache, optimisticMessage];
    }

    updateMessage(optimisticMessage);

    socketRef.current.emit("sendMessage", { message: optimisticMessage });

    try {
      const res = await fetch("/api/message/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newMessage: optimisticMessage }),
      });

    } catch (err) {
      console.error(err);
    }
  };


  // delete message

  const handleDeleteMessage = async () => {
    if (!msgId) return;

    setMessages(prev => prev.filter(m => m.messageId !== msgId.messageId));

    const lastMessage = messages[messages.length - 1];

    if (lastMessage?.messageId === msgId.messageId) {
      updateMessage({ ...lastMessage, text: "Message deleted" });
    }


    socketRef.current.emit("deleteMessage", {
      messageId: msgId.messageId,
      conversationId: chatUser.conversationId,
      participants: chatUser.participants
    });

    setDeleteMsg(false);
    setMsgId('');

    try {
      const res = await fetch("/api/message/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ msg: msgId, userId: user._id }),
      });

    } catch (err) {
      console.error(err);
    }
  };


  const handlePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePressStart = (msg) => {
    longPressTimer.current = setTimeout(() => {
      setMsgId(msg);
      if (navigator.vibrate) navigator.vibrate(30);
      setDeleteBtn(true);

      ignoreNextClick.current = true;
    }, 600);
  };


  // typing indicator

  const typingTimeoutRef = useRef(null);

  const handleTyping = (e) => {
    setInput(e.target.value);

    if (!socketRef.current || !chatUser) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("stop-typing", { from: user._id, to: chatUser.userId });
    }, 1000);

    socketRef.current.emit("typing", { from: user._id, to: chatUser.userId });
  };



  // message seen 

  const markSeen = async () => {
    if (!socketRef.current || !chatUser) return;

    socketRef.current.emit("seenMessage", {
      conversationId: chatUser.conversationId,
      senderId: chatUser.userId
    });

    await fetch("/api/message/seen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: chatUser.conversationId,
        userId: user._id
      })
    });
  };


  useEffect(() => {
    if (!chatUser?.conversationId) return;
    if (messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];

    if (lastMsg.seen) return;

    if (lastMsg.senderId === chatUser.userId) {
      markSeen();
    }
  }, [messages]);


  // message fetching

  useEffect(() => {
    if (loadMessages) {
      setMessages([]);
    }
  }, [loadMessages]);

  useEffect(() => {
    if (!chatUser?._id) return;

    setHistory(prev =>
      prev.map(conv =>
        conv.conversationId === chatUser.conversationId
          ? {
            ...conv,
            unreadCount: {
              ...conv.unreadCount,
              [user._id]: 0,
            },
          }
          : conv
      )
    );

    // messages fetch / load
    setLoadMessages(true);
    const convId = chatUser.conversationId;

    const readMessages = async () => {
      await fetch("/api/message/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: convId,
          userId: user._id,
        }),
      });
    };
    readMessages();

    if (messagesCache.current[convId]) {
      setLoadMessages(false);
      setMessages(messagesCache.current[convId]);
      return;
    }

    const fetchMessage = async () => {
      try {
        const res = await fetch("/api/message/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: convId }),
        });

        const data = await res.json();
        if (data.success) {
          messagesCache.current[convId] = data.messages;
          setMessages(data.messages);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoadMessages(false);
      }
    };

    fetchMessage();
  }, [chatUser?._id]);



  // history fetching

  useEffect(() => {
    if (!user?._id) return;

    const fetchHistory = async () => {
      const res = await fetch("/api/message/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user._id }),
      });

      const data = await res.json();
      const history = data?.history || [];

      setHistory(history);
    };

    fetchHistory();
  }, [user?._id]);


  // all users fetching

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await fetch('/api/message/users');
        const data = await res.json();
        setAllUser(data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
    fetchAllUsers();
  }, []);

  const lastActive = (lastActiveAt) => {
    if (!lastActiveAt) return "Offline";

    const now = moment();
    const last = moment(lastActiveAt);

    const diffSec = now.diff(last, "seconds");
    const diffMin = now.diff(last, "minutes");
    const diffHour = now.diff(last, "hours");
    const diffDay = now.diff(last, "days");

    if (diffSec < 30) return "exit now";
    if (diffMin < 60) return `Active ${diffMin}m ago`;
    if (diffHour < 24) return `Active ${diffHour}h ago`;
    if (diffDay === 1) return `Yesterday ${last.format("h:mm A")}`;
    if (diffDay < 7) return `${diffDay} days ago`;

    return "";
  };


  const historyActive = (lastActiveAt) => {
    if (!lastActiveAt) return "";

    const now = moment();
    const last = moment(lastActiveAt);

    const diffMin = now.diff(last, "minutes");
    const diffHour = now.diff(last, "hours");
    const diffDay = now.diff(last, "days");

    if (diffMin < 60) return `${diffMin}m`;
    if (diffHour < 24) return `${diffHour}h`;
    if (diffDay < 7) return `${diffDay}d`;

    return "";
  };


  const scrollRef = useRef(null);
  const prevMessagesLength = useRef(0);

  useEffect(() => {
    if (!scrollRef.current) return;

    const scrollEl = scrollRef.current;
    const currentMessagesLength = messages.length;

    if (currentMessagesLength > prevMessagesLength.current) {
      scrollEl.scrollTo({
        top: scrollEl.scrollHeight,
        behavior: "smooth",
      });
    }

    prevMessagesLength.current = currentMessagesLength;
  }, [messages]);

  useEffect(() => {
    prevMessagesLength.current = 0;
  }, [chatUser?.conversationId]);

  useEffect(() => {
    if (!scrollRef.current) return;
    setTimeout(() => {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
  }, [chatUser?.conversationId]);


  const filteredUsers = allUser?.filter(u =>
    u.username.toLowerCase().includes(searchInput.toLowerCase())
  );



  // call events  // call events // call events // call events // call events // call events // call events // call events // call events

  const createPeer = (to) => {
    console.log("🔧 Creating peer connection for:", to);

    const configuration = {
      iceServers: [
        // Google STUN servers
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },

        // Additional STUN servers
        { urls: 'stun:stun.voipbuster.com' },
        { urls: 'stun:stun.voipstunt.com' },

        // Free TURN servers (for NAT traversal)
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443?transport=tcp',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:turn.bistri.com:80',
          credential: 'homeo',
          username: 'homeo'
        }
      ],
      iceTransportPolicy: 'all', // Try both relay and host candidates
      iceCandidatePoolSize: 10
    };

    console.log("⚙️ Using ICE servers:", configuration.iceServers);

    const peer = new RTCPeerConnection(configuration);

    console.log("✅ Peer connection created");

    // Handle ICE candidates
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("📤 ICE candidate generated - Type:", event.candidate.type);
        console.log("📤 Candidate:", event.candidate.candidate.substring(0, 100) + "...");

        socketRef.current.emit("ice-candidate", {
          from: user._id,
          to: to,
          candidate: event.candidate
        });
      } else {
        console.log("✅ ICE gathering complete");
      }
    };

    // Handle ICE gathering state
    peer.onicegatheringstatechange = () => {
      console.log("📡 ICE gathering state:", peer.iceGatheringState);
    };

    // Handle ICE connection state
    peer.oniceconnectionstatechange = () => {
      console.log("🧊 ICE connection state:", peer.iceConnectionState);

      switch (peer.iceConnectionState) {
        case 'checking':
          console.log("🔄 Checking ICE connection...");
          break;
        case 'connected':
          console.log("✅ ICE connected successfully!");
          break;
        case 'completed':
          console.log("✅ ICE completed!");
          break;
        case 'failed':
          console.error("❌ ICE connection failed");
          break;
        case 'disconnected':
          console.warn("⚠️ ICE disconnected");
          break;
        case 'closed':
          console.log("🔒 ICE connection closed");
          break;
      }
    };

    // Handle remote stream - এইটা খুবই গুরুত্বপূর্ণ!
    peer.ontrack = (event) => {
      console.log("🎬 ontrack event fired!");
      console.log("Event details:", event);

      if (event.streams && event.streams.length > 0) {
        console.log("📹 Remote streams found:", event.streams.length);
        console.log("First stream tracks:", event.streams[0].getTracks());

        const remoteStream = event.streams[0];

        // Check what kind of tracks we received
        const videoTracks = remoteStream.getVideoTracks();
        const audioTracks = remoteStream.getAudioTracks();

        console.log(`🎥 Video tracks: ${videoTracks.length}`);
        console.log(`🎵 Audio tracks: ${audioTracks.length}`);

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          console.log("✅ Remote video srcObject set");

          // Play the video
          remoteVideoRef.current.play()
            .then(() => console.log("▶️ Remote video playing"))
            .catch(err => console.error("❌ Error playing remote video:", err));
        }

        setRemoteStream(remoteStream);
      } else if (event.track) {
        console.log("🎵 Individual track received:", event.track.kind);
        // Create a new stream for the track
        const newStream = new MediaStream([event.track]);

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = newStream;
          console.log(`✅ ${event.track.kind} track set to video element`);
        }
        setRemoteStream(newStream);
      }
    };

    // Handle connection state
    peer.onconnectionstatechange = () => {
      console.log("🔗 Peer connection state:", peer.connectionState);
    };

    // Handle signaling state
    peer.onsignalingstatechange = () => {
      console.log("📡 Signaling state:", peer.signalingState);
    };

    return peer;
  };



  const acceptCall = async () => {
    if (!incomingCall) {
      console.error("❌ No incoming call to accept");
      return;
    }

    console.log("📞 Accepting call from:", incomingCall.from);
    console.log("📝 Offer received:", incomingCall.offer);

    try {
      // Get local media stream FIRST
      console.log("🎥 Requesting local media...");
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      console.log("✅ Local media acquired");
      console.log("📹 Local tracks:", localStream.getTracks());

      setStream(localStream);

      // Set local video stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current.muted = true;
        console.log("🎥 Local video set");
      }

      // Create peer connection
      console.log("🔗 Creating peer for answer...");
      const peer = createPeer(incomingCall.from);
      peerRef.current = peer; // ✅ এই লাইন যোগ করুন!

      // Add local tracks to peer connection
      localStream.getTracks().forEach(track => {
        console.log(`➕ Adding ${track.kind} track to peer`);
        peer.addTrack(track, localStream);
      });

      // Set remote description from offer
      console.log("📝 Setting remote description...");
      await peer.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      console.log("✅ Remote description set");

      // Create and set local description (answer)
      console.log("📝 Creating answer...");
      const answer = await peer.createAnswer();
      console.log("📝 Answer created:", answer);

      await peer.setLocalDescription(new RTCSessionDescription(answer));
      console.log("✅ Local description set");

      // Send answer to caller
      console.log("📤 Sending answer to:", incomingCall.from);
      socketRef.current.emit("answer-call", {
        to: incomingCall.from,
        answer: answer
      });

      setCallAccepted(true);
      setIncomingCall(null);

      console.log("✅ Call accepted successfully");

    } catch (error) {
      console.error("❌ Error accepting call:", error);
      alert("Error accepting call: " + error.message);
    }
  };


  const endCallCleanup = () => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    if (remoteStream) {
      setRemoteStream(null);
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setCallAccepted(false);
    setCalling(false);
    setCallEnded(true);
    setIncomingCall(null);
    pendingCandidates.current = [];
  };

  const endCall = () => {
    console.log("📞 Ending call...");

    if (chatUser?.userId) {
      socketRef.current.emit("end-call", {
        to: chatUser.userId
      });
    }

    endCallCleanup();

    setCallAccepted(false);
    setCalling(false);
    setCallEnded(true);
    setIncomingCall(null);
    setStream(null);
    setRemoteStream(null);
    setShowLocalVideo(false);
    setShowRemoteVideo(false);
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
    pendingCandidates.current = [];

    console.log("✅ Call ended successfully");
  };

  // Voice call
  const handleVoiceCall = async () => {
    if (!chatUser?.userId) {
      alert("Please select a user to call");
      return;
    }

    console.log("🎤 Starting voice call to:", chatUser.userId);

    try {
      setCalling(true);

      // Get audio only stream
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true
      });

      console.log("🎤 Audio stream acquired");
      setStream(localStream);

      // ✅ ভয়েস কলেও localVideoRef সেট করুন (কিন্তু শুধু black screen দেখাবে)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null; // ভিডিও নেই
        // অথবা একটি কালো স্ক্রিন দেখাতে পারেন
        const blackCanvas = document.createElement('canvas');
        blackCanvas.width = 640;
        blackCanvas.height = 480;
        const context = blackCanvas.getContext('2d');
        context.fillStyle = 'black';
        context.fillRect(0, 0, blackCanvas.width, blackCanvas.height);

        const blackStream = blackCanvas.captureStream(0);
        localVideoRef.current.srcObject = blackStream;
        localVideoRef.current.muted = true;
      }

      // Create peer connection for voice
      const peer = createPeer(chatUser.userId);
      peerRef.current = peer;

      // Add audio track
      localStream.getTracks().forEach(track => {
        peer.addTrack(track, localStream);
      });

      // Create offer (audio only)
      const offer = await peer.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false // No video for voice call
      });

      await peer.setLocalDescription(new RTCSessionDescription(offer));

      // Send offer
      socketRef.current.emit("call-user", {
        from: user._id,
        to: chatUser.userId,
        offer: offer
      });

      console.log("🎤 Voice call initiated");

    } catch (error) {
      console.error("🎤 Voice call error:", error);
      alert("Voice call error: " + error.message);
      setCalling(false);
    }
  };

  // Video call
  const handleVideoCall = async () => {
    if (!chatUser?.userId) {
      alert("Please select a user to call");
      return;
    }

    console.log("📹 Starting video call to:", chatUser.userId);

    try {
      setCalling(true);

      // Get video and audio stream
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: true
      });

      console.log("📹 Video stream acquired");
      setStream(localStream);

      // Set local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current.muted = true;
      }

      // Create peer connection
      const peer = createPeer(chatUser.userId);
      peerRef.current = peer; // ✅ এই লাইন যোগ করুন!

      // Add tracks
      localStream.getTracks().forEach(track => {
        peer.addTrack(track, localStream);
      });

      // Create offer
      const offer = await peer.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await peer.setLocalDescription(new RTCSessionDescription(offer));

      // Send offer
      socketRef.current.emit("call-user", {
        from: user._id,
        to: chatUser.userId,
        offer: offer
      });

      console.log("📹 Video call initiated");

    } catch (error) {
      console.error("📹 Video call error:", error);
      alert("Video call error: " + error.message);
      setCalling(false);
    }
  };

  useEffect(() => {
    console.log("Stream:", stream);
    console.log("Remote Stream:", remoteStream);
    console.log("Call Accepted:", callAccepted);
    console.log("Calling:", calling);
    console.log("Peer Ref:", peerRef.current);
  }, [stream, remoteStream, callAccepted, calling]);

  return (
    <div className="h-screen w-full bg-linear-to-br from-[#1f1c2c] to-[#928DAB] sm:p-4 text-black">
      <div className="mx-auto h-full max-w-5xl sm:rounded-2xl shadow-xl overflow-hidden flex bg-gray-200 sm:bg-gray-400" >
        <aside className={`fixed sm:static top-0 left-0 z-20 h-full transform transition-all duration-300 ease-in-out ${mobileView ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0 w-full backdrop-blur ${fullView ? 'sm:w-80' : 'sm:w-0'} ${mobileView ? 'w-full' : 'w-0'} overflow-hidden border-r border-gray-200`}>
          <div className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Chats</h2>
              <Link href="/components/profile">
                <img
                  src={user?.image}
                  alt={user?.username}
                  className="h-11 w-11 rounded-full object-cover outline-2 outline-green-600"
                />
              </Link>
            </div>
            <div className="mt-3 relative">
              <div className="relative w-full flex items-center justify-center gap-x-1">
                <input
                  type="text"
                  placeholder="Search Messenger"
                  className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                  value={searchInput}
                  onFocus={() => setIsSearch(true)}
                  onChange={e => setSearchInput(e.target.value)}
                />

              </div>
              {isSearch && (
                <div className="absolute top-10 left-0 w-full h-screen" onClick={() => {
                  if (isSearch) setIsSearch(false);
                }}>
                  <div className="w-full relative max-h-80 bg-white rounded-2xl space-y-1.5 shadow-lg border border-gray-200 p-4 overflow-y-auto z-10 scrollbar">
                    {filteredUsers?.filter(self => self._id !== user?._id).map(u => (
                      <div key={u._id} className="flex bg-gray-200 items-center gap-3 p-2 rounded-xl hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          const findHistory = history.find(h => h.participants.includes(u._id) && h.participants.includes(user._id));
                          if (findHistory) {
                            setChatUser(findHistory);
                          } else {
                            setChatUser({
                              _id: Date.now().toString(),
                              conversationId: Date.now().toString(),
                              participants: [user._id, u._id],
                              userId: u._id,
                              username: u.username,
                              image: u.image,
                              lastActiveAt: u.lastActiveAt,
                              lastMessage: "",
                              lastMessageAt: null,
                              lastMessageSenderId: null,
                              unreadCount: {}
                            });
                          }
                          setMobileView(false);
                          setIsSearch(false);
                        }}
                      >
                        <img src={u.image} alt={u.username} className="h-10 w-10 rounded-full object-cover" />
                        <div>
                          <p className="font-medium">{u._id === user?._id ? 'You' : u.username}</p>
                          <p className="text-xs text-gray-500">
                            {onlineUsers.includes(u._id) ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Active now
                              </span>
                            )
                              : (
                                <span className="text-gray-500">
                                  {lastActive(u.lastActiveAt)}
                                </span>
                              )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="h-[calc(100%-92px)] overflow-y-auto">
            {history.map(conv => {

              const lastMsgDate = conv.lastMessageAt
                ? new Date(conv.lastMessageAt)
                : new Date();

              const today = new Date();
              const isToday =
                lastMsgDate.getDate() === today.getDate() &&
                lastMsgDate.getMonth() === today.getMonth() &&
                lastMsgDate.getFullYear() === today.getFullYear();

              return (
                <button
                  key={conv._id}
                  className={`w-full flex items-center gap-3 border-b border-b-gray-100 px-4 py-3 text-left hover:bg-indigo-200 ${conv.userId === chatUser?.userId ? "bg-indigo-200" : ""}`}
                  onClick={() => {
                    const findHistory = history.find(h => h.participants.includes(conv.userId) && h.participants.includes(user._id));
                    if (findHistory) {
                      setChatUser(findHistory);
                    } else {
                      setChatUser({
                        _id: Date.now().toString(),
                        conversationId: Date.now().toString(),
                        participants: [user._id, u._id],
                        userId: u._id,
                        username: u.username,
                        image: u.image,
                        lastActiveAt: u.lastActiveAt,
                        lastMessage: "",
                        lastMessageAt: null,
                        lastMessageSenderId: null,
                        unreadCount: {}
                      });
                    }
                    setMobileView(false);
                  }}
                >

                  <div className="relative h-11 w-11">
                    <img
                      src={conv.image}
                      alt={conv.username}
                      className="w-full h-full rounded-full object-center object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1">
                      {onlineUsers.includes(conv.userId) ? (
                        <span className="inline-block w-3 h-3 bg-green-600 rounded-full"></span>
                      ) : (
                        <span
                          className={`bg-green-600 text-[10px] rounded-full text-white inline-flex items-center justify-center ${lastActive(conv.lastActiveAt) ? "px-1" : ""
                            }`}
                        >
                          {historyActive(conv.lastActiveAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 flex flex-col">
                    <p className="truncate font-medium">{conv.username}</p>

                    <div className={`flex items-center gap-2`}>
                      <p className="truncate text-xs text-gray-500 max-w-28">
                        {conv?.lastMessageSenderId === user?._id
                          ? `You: ${conv.lastMessage}`
                          : conv.lastMessage}
                      </p>

                      <p className="text-[10px] text-gray-400">
                        {isToday
                          ? lastMsgDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                          })

                          : lastMsgDate.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                          })
                        }
                      </p>
                    </div>
                  </div>

                  {conv.unreadCount?.[user._id] > 0 && (
                    <span className="
    ml-auto 
    min-w-5 
    h-5 
    px-1
    flex 
    items-center 
    justify-center 
    rounded-full 
    bg-linear-to-r from-red-500 to-pink-500
    text-white 
    text-[11px] 
    font-bold 
    shadow-md
  ">
                      {conv.unreadCount[user._id] > 99 ? "99+" : conv.unreadCount[user._id]}
                    </span>
                  )}

                </button>
              );
            })}

          </div>
        </aside>

        {
          chatUser && (<main className={`flex-1 mb-0 flex flex-col ${mobileView && isMobile ? 'hidden' : 'flex'} overflow-hidden transition-all duration-300 relative`}>

            <div className="sticky sm:top-0 top-0 bg-white z-10 flex items-center gap-3 border-b border-gray-200 px-5 py-3 backdrop-blur">
              <IoIosArrowBack className={`text-2xl ${fullView ? 'rotate-0' : 'rotate-0 sm:rotate-180'} transition-all duration-300 cursor-pointer`} onClick={() => {
                setFullView(!fullView);
                if (window.innerWidth < 660) {
                  setChatUser(null);
                  setMobileView(true);
                }
              }} />
              {chatUser && (
                <div className="flex items-center justify-center">
                  <img src={chatUser.image} className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold w-30 truncate">{chatUser.username}</p>
                    <p className="text-xs text-gray-500">
                      {onlineUsers.includes(chatUser.userId)
                        ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Active now
                          </span>
                        )
                        : (
                          <span className="text-gray-500">
                            {lastActive(chatUser.lastActiveAt || chatUser?.user?.lastActiveAt)}
                          </span>
                        )}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-x-5 self-end ml-auto">
                <button
                  className="cursor-pointer size-9 bg-green-600 flex items-center justify-center rounded-full text-white hover:bg-green-700"
                  onClick={handleVoiceCall}
                  title="Voice Call"
                >
                  <IoCall className="text-xl" />
                </button>

                <button
                  className="cursor-pointer size-9 bg-blue-600 flex items-center justify-center rounded-full text-white hover:bg-blue-700"
                  onClick={handleVideoCall}
                  title="Video Call"
                >
                  <IoVideocam className="text-xl" />
                </button>
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto p-4 pl-2 scrollbar"
              ref={scrollRef}
              onClick={() => {
                if (window.innerWidth > 660 && ignoreNextClick.current) {
                  ignoreNextClick.current = false;
                  return;
                }
                if (deleteBtn) setDeleteBtn(false);
              }}
            >
              {messages?.map((msg, index) => {
                const isSender = msg.senderId === user._id;
                const showAvatar =
                  isSender &&
                  msg.seen &&
                  index === messages.length - 1;
                return (
                  <div key={msg._id} className={`mb-2 relative flex ${isSender ? "justify-end" : "justify-start"}`}>
                    <div className="flex flex-col items-end">
                      <div className="flex items-start justify-start gap-1 relative">

                        {isSender && deleteBtn && (msgId.messageId === msg.messageId) && (
                          <div className="absolute z-10 -left-14 self-center rounded-md sm:bg-white bg-gray-400 text-xl text-white flex flex-col gap-y-2 p-2">
                            <button className="w-8 h-8 flex items-center justify-center bg-red-600 rounded-full" onClick={(e) => {
                              e.stopPropagation();
                              setDeleteMsg(true);
                            }}><MdDeleteForever /></button>

                            <button
                              className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(msg.text);
                                setDeleteBtn(false);
                              }}
                            >
                              <FaCopy />
                            </button>

                          </div>
                        )}

                        {!isSender && <img src={chatUser.image} alt="user" className="w-5 h-5 mt-px rounded-full object-center object-cover" />}

                        <div
                          className={`select-none rounded-2xl px-3 py-2 text-sm shadow-sm ${isSender ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-900"
                            }`}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handlePressStart(msg);
                          }}
                          onMouseUp={(e) => {
                            e.stopPropagation();
                            handlePressEnd();
                          }}
                          onMouseLeave={handlePressEnd}

                          onTouchStart={(e) => {
                            e.stopPropagation();
                            handlePressStart(msg);
                          }}
                          onTouchEnd={(e) => {
                            e.stopPropagation();
                            handlePressEnd();
                          }}
                        >

                          {msg.text && <p className="wrap-break-word max-w-64 sm:max-w-96">{msg.text}</p>}
                          {msg.file_url && (() => {
                            const isVideo = /\.(mp4|webm|mov)$/i.test(msg.file_url);
                            if (isVideo) {
                              return (
                                <video
                                  src={msg.file_url}
                                  controls
                                  className="mt-2 w-60 sm:w-96 max-w-xs rounded-lg"
                                />
                              );
                            } else {
                              return (
                                <a href={msg.file_url} target="_blank">
                                  <img
                                    src={msg.file_url}
                                    alt="sent"
                                    className="mt-2 w-60 sm:w-96 max-w-xs rounded-lg"
                                  />
                                </a>
                              );
                            }
                          })()}

                          <div className="mt-1 text-[10px] select-none flex justify-between items-center">
                            <span>{moment(msg.createdAt).format("h:mm A")}</span>
                          </div>
                        </div>
                      </div>
                      {showAvatar && (
                        <img
                          src={chatUser.image}
                          alt="user"
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      )}
                      {isSender && !msg.seen && (
                        <span className="text-[10px] font-semibold">Unread</span>
                      )}
                    </div>

                  </div>
                );
              })}
              {loadMessages && (
                <div className="absolute inset-0 flex items-center justify-center z-10 ">
                  <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              {isTyping && (
                <div className="flex items-center gap-2 text-sm text-gray-500 ml-8 mt-1 animate-pulse">
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
                  </span>
                </div>
              )}

              {deleteMsg && (
                <div className="absolute w-72 inset-0 z-50 flex items-center justify-center text-white bg-opacity-50 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
                  <div className="bg-gray-400 sm:bg-gray-600 p-6 rounded-xl shadow-lg w-80 text-center">
                    <h2 className="text-lg font-semibold mb-4">Delete this message?</h2>
                    <div className="flex justify-between gap-4">
                      <button
                        className="flex-1 py-2 rounded-lg text-black bg-gray-200 hover:bg-gray-300"
                        onClick={() => setDeleteMsg(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700"
                        onClick={() => handleDeleteMessage()}
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Composer */}
            <div className="border-t border-gray-200 p-3">
              <div className="flex flex-col gap-2 rounded-2xl bg-gray-50 p-2 ring-1 ring-gray-200 relative">

                {/* File Preview */}
                {file && (
                  <div className="relative w-32 h-32">
                    {file.type.startsWith("video/") ? (
                      <video
                        src={URL.createObjectURL(file)}
                        controls
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    )}
                    <button
                      onClick={() => setFile(null)}
                      className="absolute -top-2 -right-2 bg-gray-200 rounded-full p-1 hover:bg-gray-300"
                    >
                      <ImCross className="text-sm" />
                    </button>
                  </div>
                )}


                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    placeholder="Aa..."
                    className="flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
                    onChange={handleTyping}
                  />


                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={e => setFile(e.target.files[0])}
                    className="hidden"
                    id="fileInput"
                  />

                  <label htmlFor="fileInput" className="cursor-pointer self-center flex items-center justify-center">
                    <FaImage className="text-gray-600 text-3xl hover:text-indigo-500" />
                  </label>
                  {input || file ? (
                    <button
                      className={`inline-flex h-9 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white
  ${isUploading ? 'pointer-events-none' : 'pointer-events-auto'}
  bg-indigo-700`}
                      onClick={() => {
                        if (!file) {
                          inputRef.current?.focus({ preventScroll: true });
                        }
                        handleSendMessage();
                      }}
                      disabled={isUploading}
                    >
                      {isUploading ? "Uploading..." : "Send"}
                    </button>

                  ) : (
                    <button
                      className="text-red-600 inline-flex h-9 text-2xl ml-2 cursor-pointer items-center justify-center"
                      onClick={() => handleSendMessage("❤️")}
                    >
                      <FaHeart />
                    </button>
                  )}

                </div>
              </div>
            </div>

          </main>)
        }
      </div >

      {/* // call events  // call events // call events // call events // call events // call events // call events // call events // call events */}


      {incomingCall && !callAccepted && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-2xl text-center text-white max-w-md w-full mx-4">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl">
              📞
            </div>
            <p className="text-2xl font-bold mb-2">Incoming Call</p>
            <p className="text-lg mb-1">{chatUser?.username}</p>
            <p className="text-gray-400 mb-6">is calling you...</p>

            <div className="flex gap-4 justify-center">
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full flex items-center gap-2 font-semibold transition-all"
                onClick={rejectCall}
              >
                <span className="text-xl">✗</span>
                Decline
              </button>

              <button
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full flex items-center gap-2 font-semibold transition-all"
                onClick={acceptCall}
              >
                <span className="text-xl">✓</span>
                Accept
              </button>
            </div>

            <p className="text-gray-500 text-sm mt-6">
              {peerRef.current ? 'Connecting...' : 'Waiting for your response'}
            </p>
          </div>
        </div>
      )}


      {(callAccepted || calling) && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex-1 flex flex-col md:flex-row relative">

            {/* Local Video (Always show if available) */}
            {showLocalVideo && stream && (
              <div className="w-full md:w-1/2 relative bg-gray-900">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                  style={{ transform: 'scaleX(-1)' }}
                />
                <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-70 px-3 py-1 rounded-lg">
                  You {stream?.getVideoTracks().length ? "📹" : "🎤"}
                  {!isVideoEnabled && " (Video off)"}
                  {!isAudioEnabled && " (Muted)"}
                </div>
              </div>
            )}

            {/* Remote Video */}
            <div className={`w-full ${showLocalVideo ? 'md:w-1/2' : 'md:w-full'} relative bg-gray-800`}>
              {showRemoteVideo && remoteStream ? (
                <>
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-70 px-3 py-1 rounded-lg">
                    {chatUser?.username} {remoteStream?.getVideoTracks().length ? "📹" : "🎤"}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xl font-semibold mb-2">Connecting to {chatUser?.username}...</p>
                    <p className="text-gray-300">
                      {peerRef.current?.iceConnectionState === 'checking'
                        ? 'Checking connection...'
                        : peerRef.current?.iceConnectionState === 'connected'
                          ? 'Connected! Waiting for media...'
                          : 'Establishing connection...'}
                    </p>
                    <div className="mt-4 flex flex-col gap-2">
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${peerRef.current?.connectionState === 'connected' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                        <span>Peer: {peerRef.current?.connectionState || 'connecting'}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${peerRef.current?.iceConnectionState === 'connected' || peerRef.current?.iceConnectionState === 'completed' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                        <span>ICE: {peerRef.current?.iceConnectionState || 'gathering'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Call Controls */}
          <div className="bg-black bg-opacity-80 p-4 flex justify-center items-center gap-6">
            {/* Video Toggle */}
            <button
              onClick={() => {
                if (stream) {
                  const videoTrack = stream.getVideoTracks()[0];
                  if (videoTrack) {
                    videoTrack.enabled = !videoTrack.enabled;
                    setIsVideoEnabled(videoTrack.enabled);
                    console.log("🎥 Video", videoTrack.enabled ? "enabled" : "disabled");
                  }
                }
              }}
              className={`${isVideoEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'} text-white p-3 rounded-full flex items-center justify-center`}
              title={isVideoEnabled ? "Turn off video" : "Turn on video"}
            >
              {isVideoEnabled ? "📹" : "📵"}
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => {
                if (stream) {
                  const audioTrack = stream.getAudioTracks()[0];
                  if (audioTrack) {
                    audioTrack.enabled = !audioTrack.enabled;
                    setIsAudioEnabled(audioTrack.enabled);
                    console.log("🎤 Audio", audioTrack.enabled ? "enabled" : "disabled");
                  }
                }
              }}
              className={`${isAudioEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white p-3 rounded-full flex items-center justify-center`}
              title={isAudioEnabled ? "Mute" : "Unmute"}
            >
              {isAudioEnabled ? "🎤" : "🔇"}
            </button>

            {/* End Call Button */}
            <button
              onClick={endCall}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full flex items-center gap-2 font-semibold"
            >
              <span className="text-xl">📞</span>
              End Call
            </button>
          </div>
        </div>
      )}


    </div >
  )
}
