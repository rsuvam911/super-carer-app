import { toast } from "sonner";
import chatService, { ChatRoom } from "@/services/chatService";
import { UserRole } from "@/lib/middleware-utils";

export interface ChatUtilsOptions {
  userRole: UserRole | null;
  userId: string;
  onChatStarted?: (chat: ChatRoom) => void;
  onError?: (error: string) => void;
}

/**
 * Utility functions for managing chat workflow according to CHAT_WORKFLOW.md
 */
export class ChatUtils {
  /**
   * Start or find a chat with another user (WebSocket-only approach)
   * Redirects to chat page with provider details for new chat creation
   */
  static async startChatWithUser(
    recipientUserId: string,
    recipientName: string,
    options: ChatUtilsOptions
  ): Promise<ChatRoom | null> {
    const { userRole, userId, onChatStarted, onError } = options;

    try {
      // Validate workflow rules first
      const validation = ChatUtils.validateChatWorkflow(
        userRole,
        "provider_profile"
      );

      if (!validation.isValid) {
        const errorMessage = validation.reason || "Cannot start chat";
        onError?.(errorMessage);
        toast.error(errorMessage);
        return null;
      }

      // Generate chatroom ID using the same logic as WebSocket hook
      const chatroomId = chatService.generateChatroomId(
        userId,
        recipientUserId
      );

      // Create a virtual chat room object for consistency
      const newChat: ChatRoom = {
        id: chatroomId,
        name: recipientName,
        userId: recipientUserId,
        unread: 0,
      };

      onChatStarted?.(newChat);
      toast.success(`Chat started with ${recipientName}`);
      return newChat;
    } catch (error: any) {
      const errorMessage = "Failed to start chat";
      onError?.(errorMessage);
      toast.error(errorMessage);
      console.error("Error starting chat:", error);
      return null;
    }
  }

  /**
   * Check if a user can start a new chat based on role and workflow rules
   */
  static canUserStartNewChats(userRole: UserRole | null): boolean {
    // According to CHAT_WORKFLOW.md:
    // - Clients can directly start conversations with providers
    // - Providers cannot start new chats unless they have previous conversation
    return userRole === "client";
  }

  /**
   * Check if a user can access chat with another user from booking context
   */
  static canChatFromBooking(
    userRole: UserRole | null,
    bookingStatus: string
  ): boolean {
    // According to CHAT_WORKFLOW.md:
    // - Providers can communicate with clients from booking details page for booked clients
    // - Clients can always chat with their providers

    if (userRole === "client") {
      return true; // Clients can always chat with their providers
    }

    if (userRole === "care-provider") {
      // Providers can only chat if there's an active/confirmed booking
      const allowedStatuses = ["confirmed", "pending", "completed"];
      return allowedStatuses.includes(bookingStatus.toLowerCase());
    }

    return false;
  }

  /**
   * Validate chat workflow rules before starting a chat
   */
  static validateChatWorkflow(
    userRole: UserRole | null,
    context: "provider_profile" | "booking_detail" | "existing_chat",
    recipientRole?: UserRole | null
  ): { isValid: boolean; reason?: string } {
    if (!userRole) {
      return { isValid: false, reason: "User role not determined" };
    }

    switch (context) {
      case "provider_profile":
        // Only clients can start chats from provider profiles
        if (userRole !== "client") {
          return {
            isValid: false,
            reason: "Only clients can start chats from provider profiles",
          };
        }
        return { isValid: true };

      case "booking_detail":
        // Both roles can chat from booking details, but providers need active booking
        return { isValid: true }; // Additional validation done in canChatFromBooking

      case "existing_chat":
        // Both roles can continue existing chats
        return { isValid: true };

      default:
        return { isValid: false, reason: "Invalid chat context" };
    }
  }

  /**
   * Get appropriate chat button text based on context and role
   */
  static getChatButtonText(
    userRole: UserRole | null,
    context: "provider_profile" | "booking_detail" | "existing_chat",
    hasExistingChat: boolean = false
  ): string {
    if (hasExistingChat) {
      return "Continue Chat";
    }

    switch (context) {
      case "provider_profile":
        return "Start Chat";
      case "booking_detail":
        return userRole === "care-provider"
          ? "Chat with Client"
          : "Chat with Provider";
      case "existing_chat":
        return "Open Chat";
      default:
        return "Chat";
    }
  }
}

/**
 * Hook-like function for managing chat state in components
 */
export function useChatNavigation() {
  const navigateToChat = (chatId: string, userRole: UserRole | null) => {
    const basePath = userRole === "client" ? "/client" : "/provider";
    window.location.href = `${basePath}/chats?activeChat=${chatId}`;
  };

  /**
   * Navigate to chat with a specific user (WebSocket-only approach)
   * Uses URL parameters to pass provider info for new chat creation
   */
  const navigateToChatWithUser = async (
    recipientUserId: string,
    recipientName: string,
    options: ChatUtilsOptions
  ) => {
    // For WebSocket-only approach, navigate to chat page with provider details
    const basePath = options.userRole === "client" ? "/client" : "/provider";
    const params = new URLSearchParams({
      providerId: recipientUserId,
      providerName: recipientName,
    });

    window.location.href = `${basePath}/chats?${params.toString()}`;
  };

  return {
    navigateToChat,
    navigateToChatWithUser,
  };
}
