"use client";

import useChatWebSocket from "@/hooks/useChatWebSocket";
import { useAuth } from "@/lib/auth-context";
import { ChatRoom } from "@/services/chatService";
import {
  MessageCircle,
  MoreHorizontal,
  Search,
  Send,
  User,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { ReadyState } from "react-use-websocket";
import { toast } from "sonner";

const ProviderChatPage: React.FC = () => {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState<ChatRoom | null>(null);
  const [message, setMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use WebSocket-only chat hook (same as client)
  const {
    readyState,
    connectionStatus,
    chatRooms,
    loadChatRooms,
    messages,
    sendChatMessage,
    loadChatHistory,
    getCurrentUserId,
  } = useChatWebSocket();

  // Filter messages for the active chat
  const activeChatMessages = activeChat ? messages[activeChat.id] || [] : [];

  // Filter chat rooms based on search term
  const filteredChatRooms = chatRooms.filter((room) =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load chat rooms from API when component mounts
  useEffect(() => {
    console.log("💬 Provider component mounted, loading chat rooms...");
    loadChatRooms();
  }, [loadChatRooms]);

  // Check URL params for activeChat
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const activeChatId = urlParams.get("activeChat");

    console.log("💬 Provider URL params check:", {
      activeChatId,
      chatRoomsLength: chatRooms.length,
    });

    if (activeChatId && chatRooms.length > 0) {
      const foundChat = chatRooms.find((chat) => chat.id === activeChatId);
      if (foundChat) {
        console.log("💬 Provider found existing chat:", foundChat);
        setActiveChat(foundChat);
        // Load chat history when selecting a chat
        loadChatHistory(foundChat.id).catch((err) =>
          console.error("💬 Provider error loading chat history:", err)
        );
      }
    }
  }, [chatRooms, loadChatHistory]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChatMessages]);

  // Send a chat message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    // Debug logging
    console.log("💬 Provider send message attempt:", {
      message: message,
      activeChat: activeChat,
      readyState: readyState,
      connectionStatus: connectionStatus,
    });

    if (!message.trim()) {
      console.log("💬 Provider message is empty");
      return;
    }

    if (!activeChat) {
      console.log("💬 Provider no active chat");
      toast.error("No active chat selected");
      return;
    }

    if (readyState !== ReadyState.OPEN) {
      console.log("💬 Provider WebSocket not connected");
      toast.error("Connection not ready. Please wait...");
      return;
    }

    try {
      console.log("💬 Provider sending message via WebSocket hook");
      // Send message using WebSocket hook
      sendChatMessage(activeChat.id, message.trim());

      setMessage("");

      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      console.log("💬 Provider message sent successfully");
    } catch (err) {
      console.error("💬 Provider error sending message:", err);
      toast.error("Failed to send message");
    }
  };

  // Handle typing indicator
  const sendTypingIndicator = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      // Clear typing after 3 seconds of inactivity
    }, 3000);
  };

  // Handle chat selection
  const handleChatSelect = (chat: ChatRoom) => {
    setActiveChat(chat);
    // Load chat history for the selected chat
    loadChatHistory(chat.id).catch((err) =>
      console.error("💬 Provider error loading chat history:", err)
    );

    // Update URL to reflect the active chat
    const url = new URL(window.location.href);
    url.searchParams.set("activeChat", chat.id);
    window.history.pushState({}, "", url.toString());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Client Chats</h1>
        <p className="text-gray-500">Communicate with your clients</p>
        <div className="text-sm text-gray-500 mt-1">
          Connection status: {connectionStatus}
        </div>
      </div>

      {/* Info message for providers */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <MessageCircle className="h-5 w-5 text-amber-400 mt-0.5" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">
              Provider Chat Guidelines
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              As a provider, you can only chat with clients who have existing
              conversations or active bookings. New chats can be started from
              booking detail pages for confirmed appointments.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[calc(100vh-20px)]">
        <div className="flex h-full">
          {/* Chat List */}
          <div className="w-1/3 border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2CB] focus:border-transparent"
                />
              </div>
            </div>

            <div className="overflow-y-auto h-[calc(100%-73px)]">
              {filteredChatRooms.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">
                    {chatRooms.length === 0 ? "No chats yet" : "No chats found"}
                  </p>
                </div>
              ) : (
                filteredChatRooms.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleChatSelect(chat)}
                    className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                      activeChat?.id === chat.id ? "bg-gray-50" : ""
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                        {chat.unread > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#00C2CB] rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">
                              {chat.unread}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="ml-3 flex-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{chat.name}</h3>
                          {chat.lastMessageTimestamp && (
                            <span className="text-xs text-gray-500">
                              {new Date(
                                chat.lastMessageTimestamp
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>
                        {chat.lastMessage && (
                          <p className="text-sm text-gray-500 truncate">
                            {chat.lastMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="w-2/3 flex flex-col">
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">{activeChat.name}</h3>
                      <p className="text-xs text-gray-500">Online</p>
                    </div>
                  </div>
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <MoreHorizontal className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {activeChatMessages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center h-full">
                      <div className="text-center text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                        <p>No messages yet.</p>
                      </div>
                    </div>
                  ) : (
                    activeChatMessages.map((msg) => {
                      const currentUserId = getCurrentUserId();
                      const isCurrentUser = msg.senderId === currentUserId;

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${
                            isCurrentUser ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isCurrentUser
                                ? "bg-[#00C2CB] text-white"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isCurrentUser
                                  ? "text-white/70"
                                  : "text-gray-500"
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {isCurrentUser && <span className="ml-2">✓</span>}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {/* Typing indicators */}
                  {typingUsers.size > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex items-center">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.4s" }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-500">
                            {activeChat?.name || "User"} is typing...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-200">
                  <form
                    onSubmit={handleSendMessage}
                    className="flex items-center"
                  >
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        sendTypingIndicator();
                      }}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2CB] focus:border-transparent"
                      disabled={readyState !== ReadyState.OPEN}
                    />
                    <button
                      type="submit"
                      className="ml-2 bg-[#00C2CB] text-white p-2 rounded-full disabled:opacity-50"
                      disabled={
                        readyState !== ReadyState.OPEN || !message.trim()
                      }
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">
                    Select a chat to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderChatPage;
