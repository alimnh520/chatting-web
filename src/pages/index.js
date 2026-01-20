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

import { io } from "socket.io-client";
import { UserContext } from "./Provider";

export default function Chat() {
  const messageCacheRef = useRef({});
  const { user } = useContext(UserContext);
  const [allUser, setAllUser] = useState([]);
  const [history, setHistory] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [messages, setMessages] = useState([]);

  const [searchInput, setSearchInput] = useState("");
  const [isSearch, setIsSearch] = useState(false);
  const [fullView, setFullView] = useState(true);
  const [mobileView, setMobileView] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);


  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isTyping, setIsTyping] = useState(false);

  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!mobileView) {
      const handlePopState = (e) => {
        e.preventDefault();
        setMobileView(true);
        setChatUser(null);
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



  useEffect(() => {
    if (!user?._id) return;

    const setupSocket = async () => {
      socketRef.current = io({ path: "/api/socket" });

      socketRef.current.emit("join", { userId: user._id });

      socketRef.current.on("receiveMessage", async (msg) => {
        setMessages(prev => [...prev, msg]);
        updateMessage(msg);
      });

      socketRef.current.on("online-users", (users) => {
        setOnlineUsers(users);
      });
    };

    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?._id]);


  const updateMessage = (msg) => {
    const isMe = msg.senderId === user._id;
    const otherUserId = isMe ? msg.receiverId : msg.senderId;

    const otherUser =
      allUser.find(u => u._id === otherUserId) ||
      history.find(h => h.userId === otherUserId);

    const username = otherUser?.username || otherUser?.user?.username || "Unknown";
    const image = otherUser?.image || otherUser?.user?.image || "/avatar.png";
    const lastMessageText = msg.text || (msg.file_url ? "📷 Image/Video" : "📷 Image");

    setHistory(prev => {
      const index = prev.findIndex(
        h => h.participants.includes(msg.senderId) && h.participants.includes(msg.receiverId)
      );

      if (index !== -1) {
        const updated = [...prev];
        const updatedConv = {
          ...updated[index],
          lastMessage: lastMessageText,
          lastMessageAt: new Date(),
          lastMessageSenderId: msg.senderId,
          unreadCount: {
            ...updated[index].unreadCount,
            [otherUserId]: isMe
              ? updated[index].unreadCount?.[otherUserId] || 0
              : (updated[index].unreadCount?.[otherUserId] || 0) + 1,
          },
        };
        updated.splice(index, 1);
        return [updatedConv, ...updated];
      }

      const newConv = {
        participants: [msg.senderId, msg.receiverId],
        lastMessage: lastMessageText,
        lastMessageAt: new Date(),
        lastMessageSenderId: msg.senderId,
        userId: otherUserId,
        username,
        image,
        lastActiveAt: otherUser?.lastActiveAt || null,
        unreadCount: { [otherUserId]: isMe ? 0 : 1 },
      };

      return [newConv, ...prev];
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

    // 1️⃣ Prepare new message with temp id
    let tempId = `temp-${Date.now()}`;
    let newMessage = {
      _id: tempId,
      conversationId: chatUser?._id || tempId,
      senderId: user._id,
      receiverId: chatUser?.userId,
      text: messageText,
      file_url,
      file_id,
      seen: false,
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    updateMessage(newMessage);
    setInput('');
    setFile(null);

    if (!chatUser?._id) {
      setChatUser(prev => ({ ...prev, _id: newMessage.conversationId }));
    }

    socketRef.current.emit("sendMessage", { message: newMessage });

    try {
      const res = await fetch("/api/message/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newMessage }),
      });
      const data = await res.json();

      if (data.saveMessage) {
        setMessages(prev =>
          prev.map(m => m._id === tempId ? data.saveMessage : m)
        );

        updateMessage(data.saveMessage);

        if (!chatUser._id) {
          setChatUser(prev => ({ ...prev, _id: data.saveMessage.conversationId }));
        }
      }
    } catch (err) {
      console.error(err);
    }

  };

  useEffect(() => {
    if (!chatUser?._id) {
      setMessages([]);
      return;
    }

    const fetchMessage = async () => {
      const res = await fetch('/api/message/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: chatUser._id, })
      });

      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    };
    fetchMessage();
  }, [chatUser?._id]);



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

      if (history.length > 0 && !isMobile) {
        setChatUser(history[0]);
      }
    };

    fetchHistory();
  }, [allUser, user?._id]);


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
    const diffMinutes = now.diff(last, "minutes");
    const diffHours = now.diff(last, "hours");
    const diffDays = now.diff(last, "days");

    if (diffMinutes < 1) return "Active now";
    if (diffMinutes < 60) return `Active ${diffMinutes} min ago`;
    if (diffHours < 24) return `Active ${diffHours} hr ago`;
    if (diffDays < 1) return `Last seen ${last.format("h:mm A")}`;

    return "Offline";
  };

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const filteredUsers = allUser?.filter(u =>
    u.username.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <div className="h-screen w-full bg-linear-to-br from-[#1f1c2c] to-[#928DAB] sm: p-4 text-black">
      <div div className="mx-auto h-full max-w-5xl sm:rounded-2xl shadow-xl overflow-hidden flex bg-white sm:bg-gray-400" >
        <aside className={` fixed sm:static top-0 left-0 z-20 h-full transform transition-all duration-300 ease-in-out ${mobileView ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0 w-full backdrop-blur ${fullView ? 'sm:w-80' : 'sm:w-0'} ${mobileView ? 'w-full' : 'w-0'} overflow-hidden border-r border-gray-200`}>
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
                              _id: null,
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
                  className={`w-full flex items-center gap-3 border-b border-b-gray-100 px-4 py-3 text-left hover:bg-indigo-50 ${conv.userId === chatUser?.userId ? "bg-indigo-50" : ""}`}
                  onClick={() => {
                    const findHistory = history.find(h => h.participants.includes(conv.userId) && h.participants.includes(user._id));
                    if (findHistory) {
                      setChatUser(findHistory);
                    } else {
                      setChatUser({
                        _id: null,
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
                      {onlineUsers.includes(conv._id) ? (
                        <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                      ) : (
                        <span
                          className={`bg-green-600 text-[10px] rounded-full text-white inline-flex items-center justify-center ${lastActive(conv.lastActiveAt) ? "px-1" : ""
                            }`}
                        >
                          {lastActive(conv.lastActiveAt)}
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
                    <span className="ml-auto ...">{conv.unreadCount[user._id]}</span>
                  )}

                </button>
              );
            })}

          </div>
        </aside>

        {
          chatUser && (<main className={`flex-1 mb-0 flex flex-col ${mobileView && isMobile ? 'hidden' : 'flex'} overflow-hidden transition-all duration-300`}>

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
                      {onlineUsers.includes(chatUser._id)
                        ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Active now
                          </span>
                        )
                        : (
                          <span className="text-gray-500">
                            {lastActive(chatUser.lastActiveAt)}
                          </span>
                        )}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-x-5 self-end ml-auto">

                <button
                  className="cursor-pointer size-9 bg-red-600 flex items-center justify-center rounded-full text-white"
                  onClick={() => {
                    setCallType("audio");
                    setIsCalling(true);
                    setIsAudio(true);
                  }}
                >
                  <IoCall className="text-2xl" />
                </button>



                <button className="cursor-pointer size-9 bg-red-600 flex items-center justify-center rounded-full text-white">
                  <IoVideocam className=" text-2xl hover:text-green-600" />
                </button>

              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pl-2 scrollbar" ref={scrollRef}>
              {messages?.map((msg, index) => {
                const isSender = msg.senderId === user._id;
                const showAvatar =
                  isSender &&
                  msg.seen &&
                  index === lastReadIndex;
                return (
                  <div key={msg._id} className={`mb-2 flex ${isSender ? "justify-end" : "justify-start"}`}>
                    <div className="flex flex-col items-end">
                      <div className="flex items-start justify-start gap-1">
                        {!isSender && <img src={chatUser.image} alt="user" className="w-5 h-5 mt-px rounded-full object-center object-cover" />}
                        <div className={`rounded-2xl px-3 py-2 text-sm shadow-sm ${isSender ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-900"}`}>
                          {msg.text && <p className="wrap-break-word max-w-64 sm:max-w-96">{msg.text}</p>}
                          {msg.file_url && (() => {
                            const isVideo = /\.(mp4|webm|mov)$/i.test(msg.file_url);
                            if (isVideo) {
                              return (
                                <video
                                  src={msg.file_url}
                                  controls
                                  className="mt-2 w-64 sm:w-96 max-w-xs rounded-lg"
                                />
                              );
                            } else {
                              return (
                                <a href={msg.file_url} target="_blank">
                                  <img
                                    src={msg.file_url}
                                    alt="sent"
                                    className="mt-2 w-64 sm:w-96 max-w-xs rounded-lg"
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
              {isTyping && (
                <div className="flex items-center gap-2 text-sm text-gray-500 ml-8 mt-1 animate-pulse">
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
                  </span>
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
                    onChange={(e) => setInput(e.target.value)}
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
                        inputRef.current?.focus({ preventScroll: true });
                        handleSendMessage();
                      }}
                      disabled={isUploading || isLoading}
                    >
                      {isUploading
                        ? "Uploading..."
                        : "Send"}
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
    </div >
  )
}
