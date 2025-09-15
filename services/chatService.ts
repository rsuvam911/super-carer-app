// WebSocket-only chat utilities - No REST API calls

export interface ChatRoom {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  time?: string;
  unread: number;
  userId: string; // The other participant's user ID
  lastMessageTimestamp?: string;
}

export interface ChatMessage {
  id: string;
  fromUserId?: string; // Legacy field
  senderId?: string; // New API field
  message: string;
  chatroomId?: string;
  createdAt: string;
  fileUrl?: string;
  isOwn?: boolean;
  type?: string; // New API field
  isRead?: boolean; // New API field
}

export interface SendMessagePayload {
  message: string;
  chatroomId?: string;
  recipientUserId?: string;
  fileUrl?: string;
}

export interface StartChatPayload {
  recipientUserId: string;
  initialMessage?: string;
}

export interface ChatPermissionCheck {
  canStartChat: boolean;
  reason?: string;
}

// WebSocket-only chat utilities
class ChatService {
  // Get current user ID from localStorage token
  getCurrentUserId(): string | null {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    try {
      // Decode JWT to get user ID
      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));
      return (
        payload.userId ||
        payload.sub ||
        payload.user_id ||
        payload.nameid ||
        null
      );
    } catch (error) {
      console.error("Error extracting user ID from token:", error);
      return null;
    }
  }

  // Generate chatroom ID (consistent format: smaller GUID + "-" + larger GUID)
  generateChatroomId(userId1: string, userId2: string): string {
    const ids = [userId1, userId2].sort();
    return `${ids[0]}-${ids[1]}`;
  }

  // Get user info from localStorage
  getCurrentUser() {
    if (typeof window === "undefined") return null;

    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  // Get user role from localStorage
  getUserRole(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("userRole");
  }

  // WebSocket-only implementation - these methods are now handled by useChatWebSocket hook
  async getChatRooms(): Promise<ChatRoom[]> {
    // In WebSocket-only mode, chat rooms are managed by the useChatWebSocket hook
    // This method is kept for backwards compatibility but returns empty array
    console.warn(
      "getChatRooms called - this should be handled by useChatWebSocket hook"
    );
    return [];
  }

  async getChatHistory(chatroomId: string): Promise<ChatMessage[]> {
    // In WebSocket-only mode, chat history is managed by the useChatWebSocket hook
    // This method is kept for backwards compatibility but returns empty array
    console.warn(
      "getChatHistory called - this should be handled by useChatWebSocket hook"
    );
    return [];
  }
}

const chatService = new ChatService();
export default chatService;
