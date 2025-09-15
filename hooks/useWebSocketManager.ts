import { useCallback, useEffect, useRef, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

interface ServerMessage {
  type: string;
  timestamp?: string;
  [key: string]: unknown;
}

interface UseWebSocketManagerReturn {
  sendMessage: (message: string | object) => void;
  messages: string[];
  readyState: ReadyState;
  connectionStatus: string;
  clearMessages: () => void;
}

const useWebSocketManager = (): UseWebSocketManagerReturn => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const [socketUrl] = useState(
    process.env.NEXT_PUBLIC_SOCKET_URL + "?token=" + token || ""
  );
  const [messages, setMessages] = useState<string[]>([]);
  const messagesRef = useRef<string[]>([]);

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    share: true, // ensures multiple components can share the connection
    shouldReconnect: () => true, // auto-reconnect
  });

  // Save incoming messages
  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const data: ServerMessage = JSON.parse(lastMessage.data);

        // Handle JSON ping
        if (data.type === "ping") {
          const pongMessage = {
            type: "pong",
            timestamp: new Date().toISOString(),
          };
          sendMessage(JSON.stringify(pongMessage));
        }

        // Save as formatted JSON string for display
        const formattedMessage = JSON.stringify(data, null, 2);
        setMessages((prev) => {
          const newMessages = [...prev, formattedMessage];
          messagesRef.current = newMessages;
          return newMessages;
        });
      } catch {
        // If not JSON, just store raw message
        setMessages((prev) => {
          const newMessages = [...prev, lastMessage.data];
          messagesRef.current = newMessages;
          return newMessages;
        });
      }
    }
  }, [lastMessage, sendMessage]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  const clearMessages = useCallback(() => {
    setMessages([]);
    messagesRef.current = [];
  }, []);

  // Enhanced sendMessage function that can handle both string and object
  const sendJsonMessage = useCallback(
    (message: string | object) => {
      if (typeof message === "string") {
        sendMessage(message);
      } else {
        sendMessage(JSON.stringify(message));
      }
    },
    [sendMessage]
  );

  return {
    sendMessage: sendJsonMessage,
    messages,
    readyState,
    connectionStatus,
    clearMessages,
  };
};

export default useWebSocketManager;
