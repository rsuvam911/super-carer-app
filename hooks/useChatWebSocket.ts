import { useCallback, useEffect, useRef, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import apiClient from "@/services/apiService";

export interface ChatMessage {
  id: string;
  fromUserId?: string; // Legacy field
  senderId?: string; // New API field
  message: string;
  chatroomId: string;
  createdAt: string;
  fileUrl?: string;
  type?: string; // New API field
  isRead?: boolean; // New API field
  isOwn?: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  userId: string; // The other participant's user ID
  avatar?: string;
  lastMessage?: string;
  lastMessageTimestamp?: string;
  unread: number;
}

interface WebSocketMessage {
  type: string;
  payload: any;
}

interface UseChatWebSocketReturn {
  // Connection state
  readyState: ReadyState;
  connectionStatus: string;

  // Chat rooms
  chatRooms: ChatRoom[];
  loadChatRooms: () => Promise<void>;

  // Messages
  messages: Record<string, ChatMessage[]>; // Messages grouped by chatroom ID

  // Actions
  sendChatMessage: (
    chatroomId: string,
    message: string,
    fileUrl?: string
  ) => void;
  startNewChat: (recipientUserId: string, recipientName: string) => string; // Returns chatroom ID
  loadChatHistory: (
    chatroomId: string,
    page?: number,
    pageSize?: number,
    forceReload?: boolean
  ) => Promise<void>;

  // Utilities
  generateChatroomId: (userId1: string, userId2: string) => string;
  getCurrentUserId: () => string | null;
}

const useChatWebSocket = (): UseChatWebSocketReturn => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [loadedChatrooms, setLoadedChatrooms] = useState<Set<string>>(
    new Set()
  );

  // Get current user ID from localStorage
  const getCurrentUserId = useCallback(() => {
    if (typeof window === "undefined") {
      console.log("💬 getCurrentUserId: window undefined (SSR)");
      return null;
    }

    try {
      // Get user ID from stored user object (more reliable than JWT parsing)
      const storedUser = localStorage.getItem("user");
      console.log(
        "💬 getCurrentUserId: stored user:",
        storedUser ? "Found" : "Not found"
      );

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        const userId = userData.userId;
        console.log(
          "💬 getCurrentUserId: extracted userId from user object:",
          userId
        );
        return userId;
      }

      // Fallback: try to get from JWT token
      const token = localStorage.getItem("accessToken");
      console.log(
        "💬 getCurrentUserId: fallback to token:",
        token ? "Found" : "Not found"
      );

      if (!token) return null;

      const parts = token.split(".");
      if (parts.length !== 3) {
        console.log("💬 getCurrentUserId: Invalid token format");
        return null;
      }

      const payload = JSON.parse(atob(parts[1]));
      console.log("💬 getCurrentUserId: JWT payload:", payload);

      const userId =
        payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] ||
        payload.sub ||
        payload.user_id ||
        payload.nameid ||
        null;

      console.log("💬 getCurrentUserId: extracted userId from JWT:", userId);
      return userId;
    } catch (error) {
      console.error("💬 Error extracting user ID:", error);
      return null;
    }
  }, []);

  // Load chat rooms from API
  const loadChatRooms = useCallback(async () => {
    try {
      console.log("💬 Loading chat rooms from API...");
      const response = await apiClient.get("/chat/chatrooms");

      if (response.data && response.data.success && response.data.payload) {
        const apiChatRooms = response.data.payload.map((room: any) => ({
          id: room.chatroomId,
          name: room.user.name,
          userId: room.user.id,
          avatar: room.user.profilePic,
          lastMessage: room.lastMessage?.message,
          lastMessageTimestamp: room.lastMessage?.createdAt,
          unread: 0, // API doesn't provide unread count, set to 0
        }));

        console.log("💬 Loaded chat rooms from API:", apiChatRooms);
        setChatRooms(apiChatRooms);
      } else {
        console.log("💬 No chat rooms found in API response");
        setChatRooms([]);
      }
    } catch (error) {
      console.error("💬 Error loading chat rooms from API:", error);
      // Don't throw error, just log it - WebSocket will still work for new chats
    }
  }, []);

  // WebSocket connection
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const socketUrl =
    (process.env.NEXT_PUBLIC_SOCKET_URL || "ws://localhost:5221/ws") +
    "?token=" +
    (token || "");

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    share: true,
    shouldReconnect: () => true,
    onOpen: () => {
      console.log("💬 Chat WebSocket connected");
    },
    onError: (error) => {
      console.error("💬 Chat WebSocket error:", error);
    },
    onClose: () => {
      console.log("💬 Chat WebSocket disconnected");
    },
  });

  // Generate chatroom ID (consistent format: smaller GUID + "-" + larger GUID)
  const generateChatroomId = useCallback(
    (userId1: string, userId2: string): string => {
      const ids = [userId1, userId2].sort();
      return `${ids[0]}-${ids[1]}`;
    },
    []
  );

  // Get connection status
  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Connected",
    [ReadyState.CLOSING]: "Disconnecting",
    [ReadyState.CLOSED]: "Disconnected",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const data: WebSocketMessage = JSON.parse(lastMessage.data);

        switch (data.type) {
          case "chat.message":
            handleIncomingChatMessage(data.payload);
            break;
          case "chat.delivery.confirmation":
            console.log("💬 Message delivered:", data.payload.messageId);
            break;
          case "ping":
            // Auto-respond to ping
            sendMessage(
              JSON.stringify({
                type: "pong",
                timestamp: new Date().toISOString(),
              })
            );
            break;
          default:
            console.log("💬 Unhandled message type:", data.type);
        }
      } catch (error) {
        console.error("💬 Error parsing WebSocket message:", error);
      }
    }
  }, [lastMessage, sendMessage]);

  // Handle incoming chat message
  const handleIncomingChatMessage = useCallback(
    (payload: any) => {
      const currentUserId = getCurrentUserId();
      if (!currentUserId) return;

      const newMessage: ChatMessage = {
        id: payload.messageId || Math.random().toString(36).substr(2, 9),
        fromUserId: payload.from_user_id || payload.fromUserId, // Legacy support
        senderId: payload.senderId, // New API field
        message: payload.message,
        chatroomId: payload.chatroomId,
        createdAt: payload.createdAt || new Date().toISOString(),
        fileUrl: payload.fileUrl,
        type: payload.type,
        isRead: payload.isRead,
        isOwn:
          (payload.senderId || payload.from_user_id || payload.fromUserId) ===
          currentUserId,
      };

      // Add message to the appropriate chatroom, avoiding duplicates
      setMessages((prev) => {
        const existingMessages = prev[newMessage.chatroomId] || [];

        // Check if this message already exists (by ID or content)
        const isDuplicate = existingMessages.some(
          (msg) =>
            msg.id === newMessage.id ||
            (msg.message === newMessage.message &&
              (msg.senderId || msg.fromUserId) ===
                (newMessage.senderId || newMessage.fromUserId) &&
              Math.abs(
                new Date(msg.createdAt).getTime() -
                  new Date(newMessage.createdAt).getTime()
              ) < 1000)
        );

        if (isDuplicate) {
          console.log("💬 Duplicate incoming message detected, skipping");
          return prev;
        }

        return {
          ...prev,
          [newMessage.chatroomId]: [...existingMessages, newMessage],
        };
      });

      // Update or create chatroom entry
      const senderUserId = newMessage.senderId || newMessage.fromUserId;
      const chatroomId = newMessage.chatroomId;

      // Extract sender name from chatroom ID or use stored info
      let senderName = "Unknown User";
      let otherUserId = senderUserId;

      // Try to parse the sender name from the chatroom ID
      // The chatroom ID format is: userId1-userId2
      if (chatroomId.includes("-")) {
        const [userId1, userId2] = chatroomId.split("-");
        otherUserId = userId1 === currentUserId ? userId2 : userId1;
        senderName =
          payload.from_user_name || `User ${otherUserId.substring(0, 8)}`;
      }

      // Ensure we have a valid user ID
      const validUserId = senderUserId || otherUserId || "unknown";

      setChatRooms((prev) => {
        const existingRoomIndex = prev.findIndex(
          (room) => room.id === chatroomId
        );

        if (existingRoomIndex >= 0) {
          // Update existing room
          const updated = [...prev];
          updated[existingRoomIndex] = {
            ...updated[existingRoomIndex],
            lastMessage: newMessage.message,
            lastMessageTimestamp: newMessage.createdAt,
            unread: updated[existingRoomIndex].unread + 1,
          };
          return updated;
        } else {
          // Create new room
          const newRoom: ChatRoom = {
            id: chatroomId,
            name: senderName,
            userId: validUserId,
            lastMessage: newMessage.message,
            lastMessageTimestamp: newMessage.createdAt,
            unread: 1,
          };
          return [newRoom, ...prev];
        }
      });

      console.log("💬 Chat message received:", newMessage);
    },
    [getCurrentUserId]
  );

  // Send a chat message
  const sendChatMessage = useCallback(
    (chatroomId: string, message: string, fileUrl?: string) => {
      console.log("💬 sendChatMessage called:", {
        chatroomId,
        message,
        fileUrl,
        readyState,
      });

      if (!message.trim() && !fileUrl) {
        console.log("💬 Message is empty, returning");
        return;
      }

      if (readyState !== ReadyState.OPEN) {
        console.error("💬 WebSocket not connected, readyState:", readyState);
        return;
      }

      const currentUserId = getCurrentUserId();
      if (!currentUserId) {
        console.error("💬 Current user ID not available");
        return;
      }

      console.log("💬 Preparing message with userId:", currentUserId);

      // Create WebSocket message
      const chatMessage = {
        type: "chat.send",
        payload: {
          message: message.trim(),
          chatroomId,
          fileUrl,
        },
      };

      console.log("💬 Sending WebSocket message:", chatMessage);

      // Send via WebSocket
      sendMessage(JSON.stringify(chatMessage));

      // Add to local messages for immediate display (optimistic UI)
      const localMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        fromUserId: currentUserId, // Legacy support
        senderId: currentUserId, // New API field
        message: message.trim(),
        chatroomId,
        createdAt: new Date().toISOString(),
        fileUrl,
        type: "text",
        isRead: false,
        isOwn: true,
      };

      console.log("💬 Adding local message:", localMessage);

      setMessages((prev) => {
        const existingMessages = prev[chatroomId] || [];
        // Check if this message already exists (by content and timestamp proximity)
        const isDuplicate = existingMessages.some(
          (msg) =>
            msg.message === localMessage.message &&
            msg.senderId === localMessage.senderId &&
            Math.abs(
              new Date(msg.createdAt).getTime() -
                new Date(localMessage.createdAt).getTime()
            ) < 1000 // Within 1 second
        );

        if (isDuplicate) {
          console.log("💬 Duplicate message detected, skipping");
          return prev;
        }

        const updated = {
          ...prev,
          [chatroomId]: [...existingMessages, localMessage],
        };
        console.log("💬 Updated messages state:", updated);
        return updated;
      });

      // Update chatroom's last message
      setChatRooms((prev) => {
        const roomIndex = prev.findIndex((room) => room.id === chatroomId);
        if (roomIndex >= 0) {
          const updated = [...prev];
          updated[roomIndex] = {
            ...updated[roomIndex],
            lastMessage: message.trim(),
            lastMessageTimestamp: localMessage.createdAt,
          };
          console.log("💬 Updated chat room:", updated[roomIndex]);
          return updated;
        } else {
          console.log("💬 Chat room not found in list:", chatroomId);
        }
        return prev;
      });

      console.log("💬 Chat message sent successfully:", localMessage);
    },
    [readyState, sendMessage, getCurrentUserId]
  );

  // Start a new chat with a user
  const startNewChat = useCallback(
    (recipientUserId: string, recipientName: string): string => {
      console.log("💬 startNewChat called with:", {
        recipientUserId,
        recipientName,
      });

      const currentUserId = getCurrentUserId();
      console.log("💬 Current user ID:", currentUserId);

      if (!currentUserId) {
        console.error("💬 Current user ID not available");
        return "";
      }

      const chatroomId = generateChatroomId(currentUserId, recipientUserId);
      console.log("💬 Generated chatroom ID:", chatroomId);

      // Check if chatroom already exists
      const existingRoom = chatRooms.find((room) => room.id === chatroomId);
      if (existingRoom) {
        console.log("💬 Chat room already exists:", chatroomId);
        return chatroomId;
      }

      // Create new chatroom entry
      const newRoom: ChatRoom = {
        id: chatroomId,
        name: recipientName,
        userId: recipientUserId,
        unread: 0,
      };

      console.log("💬 About to add new room to state:", newRoom);

      setChatRooms((prev) => {
        const updated = [newRoom, ...prev];
        console.log("💬 Updated chatRooms state:", updated);
        return updated;
      });

      // Initialize empty messages array for this chatroom
      setMessages((prev) => {
        const updated = {
          ...prev,
          [chatroomId]: [],
        };
        console.log("💬 Updated messages state for room:", chatroomId);
        return updated;
      });

      console.log("💬 New chat room created successfully:", newRoom);
      return chatroomId;
    },
    [getCurrentUserId, generateChatroomId, chatRooms]
  );

  // Load chat history from API
  const loadChatHistory = useCallback(
    async (
      chatroomId: string,
      page: number = 1,
      pageSize: number = 20,
      forceReload: boolean = false
    ) => {
      try {
        // Check if we've already loaded this chatroom's history (unless forcing reload)
        if (!forceReload && loadedChatrooms.has(chatroomId)) {
          console.log(
            `💬 Chat history already loaded for room: ${chatroomId}, skipping`
          );
          return;
        }

        console.log(
          `💬 Loading chat history for room: ${chatroomId}, page: ${page}, pageSize: ${pageSize}`
        );

        const response = await apiClient.get(
          `/chat/chatrooms/${chatroomId}/messages?page=${page}&pageSize=${pageSize}`
        );

        if (response.data && response.data.success && response.data.payload) {
          const currentUserId = getCurrentUserId();
          const apiMessages = response.data.payload.map((msg: any) => ({
            id:
              msg.messageId ||
              msg.id ||
              Math.random().toString(36).substr(2, 9),
            fromUserId: msg.fromUserId || msg.userId, // Legacy support
            senderId: msg.senderId, // New API field
            message: msg.message,
            chatroomId: chatroomId,
            createdAt: msg.createdAt,
            fileUrl: msg.fileUrl,
            type: msg.type,
            isRead: msg.isRead,
            isOwn:
              (msg.senderId || msg.fromUserId || msg.userId) === currentUserId, // Set isOwn based on current user
          }));

          console.log(
            `💬 Loaded ${apiMessages.length} messages from API:`,
            apiMessages
          );

          // Replace messages for this chatroom entirely (no duplicate checking needed)
          setMessages((prev) => {
            const updated = {
              ...prev,
              [chatroomId]: apiMessages.sort(
                (a: ChatMessage, b: ChatMessage) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              ), // Sort by creation time
            };
            console.log(
              `💬 Set ${apiMessages.length} messages for chatroom ${chatroomId}`
            );
            return updated;
          });

          // Mark this chatroom as loaded
          setLoadedChatrooms((prev) => new Set([...prev, chatroomId]));
        } else {
          console.log("💬 No messages found in API response");
          // Still mark as loaded even if no messages, to prevent repeated API calls
          setLoadedChatrooms((prev) => new Set([...prev, chatroomId]));
        }
      } catch (error) {
        console.error("💬 Error loading chat history from API:", error);

        // Fallback to WebSocket request if API fails
        if (readyState === ReadyState.OPEN) {
          console.log("💬 Falling back to WebSocket history request");
          const historyRequest = {
            type: "chat.history.request",
            payload: {
              chatroomId,
              limit: pageSize,
            },
          };
          sendMessage(JSON.stringify(historyRequest));
        }
      }
    },
    [readyState, sendMessage, loadedChatrooms]
  );

  return {
    readyState,
    connectionStatus,
    chatRooms,
    loadChatRooms,
    messages,
    sendChatMessage,
    startNewChat,
    loadChatHistory,
    generateChatroomId,
    getCurrentUserId,
  };
};

export default useChatWebSocket;
