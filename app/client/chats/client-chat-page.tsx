"use client";

import useChatWebSocket from "@/hooks/useChatWebSocket";
import { useAuth } from "@/lib/auth-context";
import { ChatUtils } from "@/lib/chat-utils";
import { UserRole } from "@/lib/middleware-utils";
import chatService, { ChatMessage, ChatRoom } from "@/services/chatService";
import {
  MessageCircle,
  MoreHorizontal,
  Search,
  Send,
  User,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ReadyState } from "react-use-websocket";
import { toast } from "sonner";

const ClientChatPage: React.FC = () => {
  const { user, userRole } = useAuth();
  const [activeChat, setActiveChat] = useState<ChatRoom | null>(null);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use WebSocket-only chat hook
  const {
    readyState,
    connectionStatus,
    chatRooms,
    loadChatRooms,
    messages,
    sendChatMessage,
    startNewChat,
    loadChatHistory,
    getCurrentUserId,
  } = useChatWebSocket();

  // Filter messages for the active chat
  const activeChatMessages = activeChat ? messages[activeChat.id] || [] : [];

  // Filter chat rooms based on search term
  const filteredChatRooms = chatRooms.filter((room) =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Start a new chat from provider page - immediately create room and set as active
  const handleStartChatFromProvider = useCallback(
    async (providerId: string, providerName: string) => {
      console.log("💬 handleStartChatFromProvider called with:", {
        providerId,
        providerName,
      });

      const currentUserId = getCurrentUserId();
      console.log("💬 Current user info:", { currentUserId, userRole });

      if (!currentUserId || !userRole) {
        console.log("💬 Authentication check failed");
        toast.error("Unable to start chat: User not authenticated");
        return;
      }

      try {
        // Use ChatUtils to validate the workflow
        const canStart = ChatUtils.canUserStartNewChats(userRole as UserRole);
        console.log("💬 Can start chat check:", canStart);

        if (!canStart) {
          console.log("💬 User cannot start new chats");
          toast.error("You cannot start new chats");
          return;
        }

        console.log("💬 Creating new chat:", {
          providerId,
          providerName,
          currentUserId,
        });

        // Immediately start the chat using the WebSocket hook
        const chatroomId = startNewChat(providerId, providerName);
        console.log("💬 startNewChat returned:", chatroomId);

        if (chatroomId) {
          // Create a chat room object and set it as active immediately
          const newChatRoom: ChatRoom = {
            id: chatroomId,
            name: providerName,
            userId: providerId,
            unread: 0,
          };

          console.log("💬 Setting active chat:", newChatRoom);

          // Set as active chat immediately
          setActiveChat(newChatRoom);

          // Update URL to reflect the active chat
          const url = new URL(window.location.href);
          url.searchParams.delete("providerId");
          url.searchParams.delete("providerName");
          url.searchParams.set("activeChat", chatroomId);
          window.history.pushState({}, "", url.toString());

          toast.success(
            `Chat room created with ${providerName}. Start messaging!`
          );
          console.log("💬 Chat creation completed successfully");
        } else {
          console.log("💬 startNewChat returned empty chatroomId");
          toast.error("Failed to create chat room");
        }
      } catch (error) {
        console.error("💬 Failed to start chat:", error);
        toast.error("Failed to start chat");
      }
    },
    [getCurrentUserId, userRole, startNewChat]
  );

  // Load chat rooms from API when component mounts
  useEffect(() => {
    console.log("💬 Component mounted, loading chat rooms...");
    loadChatRooms();
  }, [loadChatRooms]);

  // Check URL params for activeChat
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const activeChatId = urlParams.get("activeChat");
    const providerId = urlParams.get("providerId");
    const providerName = urlParams.get("providerName");

    console.log("💬 URL params check:", {
      activeChatId,
      providerId,
      providerName,
      chatRoomsLength: chatRooms.length,
    });

    if (activeChatId && chatRooms.length > 0) {
      const foundChat = chatRooms.find((chat) => chat.id === activeChatId);
      if (foundChat) {
        console.log("💬 Found existing chat:", foundChat);
        setActiveChat(foundChat);
        // Load chat history when selecting a chat
        loadChatHistory(foundChat.id).catch((err) =>
          console.error("💬 Error loading chat history:", err)
        );
      }
    } else if (providerId && providerName && !activeChatId) {
      console.log("💬 Creating new chat from URL params");
      // Immediately create and start a new chat with the provider
      handleStartChatFromProvider(providerId, providerName);
    }
  }, [chatRooms, loadChatHistory, handleStartChatFromProvider]);

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
    console.log("💬 Send message attempt:", {
      message: message,
      activeChat: activeChat,
      readyState: readyState,
      connectionStatus: connectionStatus,
    });

    if (!message.trim()) {
      console.log("💬 Message is empty");
      return;
    }

    if (!activeChat) {
      console.log("💬 No active chat");
      toast.error("No active chat selected");
      return;
    }

    if (readyState !== ReadyState.OPEN) {
      console.log("💬 WebSocket not connected");
      toast.error("Connection not ready. Please wait...");
      return;
    }

    try {
      console.log("💬 Sending message via WebSocket hook");
      // Send message using WebSocket hook
      sendChatMessage(activeChat.id, message.trim());

      setMessage("");

      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setIsTyping(false);

      console.log("💬 Message sent successfully");
    } catch (err) {
      console.error("💬 Error sending message:", err);
      toast.error("Failed to send message");
    }
  };

  // Handle chat selection
  const handleChatSelect = (chat: ChatRoom) => {
    setActiveChat(chat);
    // Load chat history for the selected chat
    loadChatHistory(chat.id).catch((err) =>
      console.error("💬 Error loading chat history:", err)
    );

    // Update URL to reflect the active chat
    const url = new URL(window.location.href);
    url.searchParams.set("activeChat", chat.id);
    window.history.pushState({}, "", url.toString());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Chats</h1>
        <p className="text-gray-500">Communicate with your care providers</p>
        <div className="text-sm text-gray-500 mt-1">
          Connection status:{" "}
          <span
            className={`font-medium ${
              connectionStatus === "Connected"
                ? "text-green-600"
                : connectionStatus === "Connecting"
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {connectionStatus}
          </span>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <MessageCircle className="h-5 w-5 text-blue-400 mt-0.5" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              How to start a chat
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              To start a new conversation with a provider, visit their profile
              page and click the "Start Chat" button. A chat room will be
              created immediately.
            </p>

            {/* Debug: Create test chat button */}
            <button
              onClick={() =>
                handleStartChatFromProvider(
                  "test-provider-123",
                  "Test Provider"
                )
              }
              className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 mr-2"
            >
              🔧 Create Test Chat (Debug)
            </button>

            {/* Debug: Reload chat rooms button */}
            <button
              onClick={() => {
                console.log("💬 Manual reload chat rooms clicked");
                loadChatRooms();
              }}
              className="mt-2 px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 mr-2"
            >
              🔄 Reload Chat Rooms (API)
            </button>

            {/* Debug: Load messages button */}
            <button
              onClick={() => {
                if (activeChat) {
                  console.log(
                    "💬 Manual load chat history clicked for:",
                    activeChat.id
                  );
                  loadChatHistory(activeChat.id, 1, 20);
                } else {
                  console.log("💬 No active chat to load history for");
                }
              }}
              className="mt-2 px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
              disabled={!activeChat}
            >
              📜 Load Messages (API)
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[calc(100vh-300px)]">
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
                          <User className="h-6 w-6 text-gray-50" />
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
                    <div className="w-10 h-10 rounded-full bg-gray-20 flex items-center justify-center mr-3">
                      <User className="h-6 w-6 text-gray-50" />
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
                        <p>No messages yet. Start a conversation!</p>
                      </div>
                    </div>
                  ) : (
                    activeChatMessages.map((msg) => {
                      // Check both senderId (new API) and fromUserId (legacy) to determine if message is from current user
                      const currentUserId = getCurrentUserId();
                      const messageSenderId = msg.senderId || msg.fromUserId;
                      const isCurrentUser = messageSenderId === currentUserId;

                      console.log("💬 Message render check:", {
                        messageId: msg.id,
                        senderId: msg.senderId,
                        fromUserId: msg.fromUserId,
                        currentUserId,
                        isCurrentUser,
                      });

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
                              {isCurrentUser && (
                                <span className="ml-2">
                                  {msg.isRead ? "✓✓" : "✓"}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {/* Typing indicators */}
                  {typingUsers.size > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-gray-10 rounded-lg p-3">
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
                  {/* Connection status warning */}
                  {readyState !== ReadyState.OPEN && (
                    <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                      WebSocket {connectionStatus}. Messages cannot be sent
                      until connected.
                    </div>
                  )}

                  <form
                    onSubmit={handleSendMessage}
                    className="flex items-center"
                  >
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        readyState !== ReadyState.OPEN
                          ? "Connecting..."
                          : "Type a message..."
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2CB] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={readyState !== ReadyState.OPEN}
                    />
                    <button
                      type="submit"
                      className="ml-2 bg-[#00C2CB] text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={
                        readyState !== ReadyState.OPEN || !message.trim()
                      }
                      title={
                        readyState !== ReadyState.OPEN
                          ? "WebSocket not connected"
                          : "Send message"
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

export default ClientChatPage;
