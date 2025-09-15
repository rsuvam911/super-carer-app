"use client"

import React, { useState } from "react";
import { ReadyState } from "react-use-websocket";
import useWebSocketManager from "../hooks/useWebSocketManager";

const WebSocketPage: React.FC = () => {
    const [message, setMessage] = useState("");
    const { sendMessage, messages, readyState, connectionStatus } = useWebSocketManager();

    const handleSendMessage = () => {
        if (message.trim()) {
            sendMessage(message);
            setMessage("");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
            <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-2xl font-bold mb-4 text-center">
                    WebSocket Test Page
                </h1>

                <p className="text-sm text-gray-500 mb-4">
                    Connection status:{" "}
                    <span
                        className={`font-medium ${readyState === ReadyState.OPEN
                            ? "text-green-600"
                            : "text-red-600"
                            }`}
                    >
                        {connectionStatus}
                    </span>
                </p>

                {/* Message input */}
                <div className="flex space-x-2 mb-4">
                    <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button
                        onClick={handleSendMessage}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                        disabled={readyState !== ReadyState.OPEN}
                    >
                        Send
                    </button>
                </div>

                {/* Messages */}
                <div className="h-48 overflow-y-auto border border-gray-200 rounded p-3 bg-gray-50">
                    {messages.length === 0 ? (
                        <p className="text-gray-40 text-sm">No messages yet...</p>
                    ) : (
                        messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className="mb-2 p-2 rounded bg-blue-100 text-blue-800"
                            >
                                {msg}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default WebSocketPage;
