"use client"

import type React from "react"

import { useState } from "react"
import { Search, Send } from "lucide-react"

export default function ChatsPage() {
  const [activeChat, setActiveChat] = useState<string | null>("chat1")
  const [message, setMessage] = useState("")

  // Mock chat data
  const chats = [
    {
      id: "chat1",
      name: "Albert Flores",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Thank you for the great service yesterday.",
      time: "10:30 AM",
      unread: 2,
      messages: [
        {
          id: 1,
          sender: "them",
          text: "Hello, I wanted to confirm our appointment for tomorrow at 2 PM.",
          time: "Yesterday, 9:15 AM",
        },
        {
          id: 2,
          sender: "me",
          text: "Hi Albert, yes the appointment is confirmed for 2 PM tomorrow. I'll be there on time.",
          time: "Yesterday, 9:20 AM",
        },
        {
          id: 3,
          sender: "them",
          text: "Great, thank you! Is there anything I should prepare before you arrive?",
          time: "Yesterday, 9:25 AM",
        },
        {
          id: 4,
          sender: "me",
          text: "No special preparation needed. Just make sure I can access the bathroom and kitchen areas for the care routine.",
          time: "Yesterday, 9:30 AM",
        },
        {
          id: 5,
          sender: "them",
          text: "Perfect, everything will be accessible. See you tomorrow!",
          time: "Yesterday, 9:35 AM",
        },
        { id: 6, sender: "me", text: "Looking forward to it. Have a great day!", time: "Yesterday, 9:40 AM" },
        { id: 7, sender: "them", text: "Thank you for the great service yesterday.", time: "Today, 10:30 AM" },
      ],
    },
    {
      id: "chat2",
      name: "Cameron Williamson",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Can we reschedule tomorrow's appointment?",
      time: "Yesterday",
      unread: 0,
      messages: [
        {
          id: 1,
          sender: "them",
          text: "Hi there, I was wondering if we could discuss my mother's care plan.",
          time: "Monday, 2:15 PM",
        },
        {
          id: 2,
          sender: "me",
          text: "Of course, Cameron. I'd be happy to discuss that with you. What aspects would you like to review?",
          time: "Monday, 2:20 PM",
        },
        {
          id: 3,
          sender: "them",
          text: "I think we need to adjust her medication schedule and possibly add some physical therapy exercises.",
          time: "Monday, 2:30 PM",
        },
        {
          id: 4,
          sender: "me",
          text: "That sounds reasonable. I can prepare some recommendations for our next meeting.",
          time: "Monday, 3:00 PM",
        },
        {
          id: 5,
          sender: "them",
          text: "Can we reschedule tomorrow's appointment? Something came up at work.",
          time: "Yesterday, 4:45 PM",
        },
      ],
    },
    {
      id: "chat3",
      name: "Eleanor Pena",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "The exercises you recommended are helping a lot!",
      time: "Apr 1",
      unread: 0,
      messages: [
        {
          id: 1,
          sender: "them",
          text: "Hello, I wanted to let you know that the exercises you recommended are helping a lot!",
          time: "Apr 1, 11:20 AM",
        },
        {
          id: 2,
          sender: "me",
          text: "That's wonderful to hear, Eleanor! Consistency is key with those exercises.",
          time: "Apr 1, 11:45 AM",
        },
      ],
    },
  ]

  const currentChat = chats.find((chat) => chat.id === activeChat)

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    // In a real app, you would send this message to your backend
    console.log("Sending message:", message)

    // Clear the input
    setMessage("")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Chats</h1>
        <p className="text-gray-500">Communicate with your clients</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[calc(100vh-220px)]">
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
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2CB] focus:border-transparent"
                />
              </div>
            </div>

            <div className="overflow-y-auto h-[calc(100%-73px)]">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    activeChat === chat.id ? "bg-gray-50" : ""
                  }`}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img
                          src={chat.avatar || "/placeholder.svg"}
                          alt={chat.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {chat.unread > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#00C2CB] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">{chat.unread}</span>
                        </div>
                      )}
                    </div>

                    <div className="ml-3 flex-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{chat.name}</h3>
                        <span className="text-xs text-gray-500">{chat.time}</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="w-2/3 flex flex-col">
            {currentChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img
                      src={currentChat.avatar || "/placeholder.svg"}
                      alt={currentChat.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{currentChat.name}</h3>
                    <p className="text-xs text-gray-500">Online</p>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {currentChat.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender === "me" ? "bg-[#00C2CB] text-white" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${message.sender === "me" ? "text-white/70" : "text-gray-500"}`}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex items-center">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2CB] focus:border-transparent"
                    />
                    <button type="submit" className="ml-2 bg-[#00C2CB] text-white p-2 rounded-full">
                      <Send className="h-5 w-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500">Select a chat to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

