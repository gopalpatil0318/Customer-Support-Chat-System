import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useSupportChat } from "../context/SupportChatContext"
import axios from "axios"
import { LogOut, CheckCircle, AlertCircle, Users } from "lucide-react"

const API_URL = "http://localhost:3000/api"

interface Chat {
  id: number
  status: "active" | "resolved"
  created_at: string
  customer_id: number
  customer_name: string
  agent_id: number
  agent_name: string
  agent_product_name: string
}

interface Message {
  id: number
  sender_id: number
  message: string
  sent_at: string
}


const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { setChatSessionId, setChatStatus, socket } = useSupportChat()

  useEffect(() => {
    fetchChats()
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on("new_chat_session", fetchChats)
      socket.on("query_resolved", handleQueryResolved)
      socket.on("query_active", handleQueryActive)
      socket.on("new_message", handleNewMessage)

      return () => {
        socket.off("new_chat_session", fetchChats)
        socket.off("query_resolved", handleQueryResolved)
        socket.off("query_active", handleQueryActive)
        socket.off("new_message", handleNewMessage)
      }
    }
  }, [socket])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchChats = async () => {
    try {
      const response = await axios.get(`${API_URL}/chats`, { withCredentials: true })
      setChats(response.data.chats)
    } catch (error) {
      console.error("Failed to fetch chats:", error)
    }
  }

  const fetchMessagesForAdmin = async (chatSessionId: number) => {
    try {
      const response = await axios.get(`${API_URL}/chat/${chatSessionId}/messagesforadmin`, {
        withCredentials: true,
      })
      setMessages(response.data.messages)
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    }
  }

  const handleNewMessage = (data: { chatSessionId: number }) => {
    if (selectedChat?.id === data.chatSessionId) {
      fetchMessagesForAdmin(data.chatSessionId)
    }
  }

  const handleQueryResolved = (data: { chatSessionId: number }) => {
    setChats((prevChats) =>
      prevChats.map((chat) => (chat.id === data.chatSessionId ? { ...chat, status: "resolved" } : chat)),
    )
    if (selectedChat?.id === data.chatSessionId) {
      setSelectedChat((prev) => (prev ? { ...prev, status: "resolved" } : null))
      setChatStatus("resolved")
    }
  }

  const handleQueryActive = (data: { chatSessionId: number }) => {
    setChats((prevChats) =>
      prevChats.map((chat) => (chat.id === data.chatSessionId ? { ...chat, status: "active" } : chat)),
    )
    if (selectedChat?.id === data.chatSessionId) {
      setSelectedChat((prev) => (prev ? { ...prev, status: "active" } : null))
      setChatStatus("active")
    }
  }

  const handleChatSelect = async (chat: Chat) => {
    setSelectedChat(chat)
    setChatSessionId(chat.id)
    setChatStatus(chat.status)
    await fetchMessagesForAdmin(chat.id)
    socket.emit("join_chat", chat.id)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
    } catch (error) {
      console.error("Failed to logout", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/4 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
        </div>
        <div className="p-4">
          <h2 className="text-lg font-medium text-gray-700 mb-2">All Chats</h2>
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => handleChatSelect(chat)}
              className={`w-full flex items-center p-3 mb-2 rounded-lg transition-colors duration-200 ${
                selectedChat?.id === chat.id ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
            >
              <div className="flex-shrink-0 mr-3">
           
                <Users className={`w-6 h-6 ${chat.status === "active" ? "text-green-500" : "text-gray-500"}`} />
              </div>
              <div className="flex-grow text-left">
                <div className="text-sm font-medium text-gray-900">
                  {chat.customer_name} - {chat.agent_name}
                </div>
                <div className="text-xs text-gray-500">{chat.agent_product_name}</div>
              </div>
              <div
                className={`flex-shrink-0 w-2 h-2 rounded-full ${chat.status === "active" ? "bg-green-500" : "bg-gray-500"}`}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              {selectedChat
                ? `Chat Details - ${selectedChat.customer_name} & ${selectedChat.agent_name}`
                : "Select a chat"}
            </h2>
            <div className="flex items-center">
              <span className="mr-4 text-sm text-gray-700">{user?.name} (Admin)</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4">
          {selectedChat ? (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                <h3 className="text-xl font-semibold mb-4">Chat Session </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Customer</p>
                    <p className="text-base">{selectedChat.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Agent</p>
                    <p className="text-base">{selectedChat.agent_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Product</p>
                    <p className="text-base">{selectedChat.agent_product_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p
                      className={`text-base flex items-center ${
                        selectedChat.status === "active" ? "text-green-600" : "text-gray-600"
                      }`}
                    >
                      {selectedChat.status === "active" ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Resolved
                        </>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created At</p>
                    <p className="text-base">{formatDate(selectedChat.created_at)}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold mb-4">Chat Messages</h4>
                <div className="h-[400px] mb-4 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-4 flex ${
                        message.sender_id === selectedChat.agent_id ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl p-3 rounded-lg ${
                          message.sender_id === selectedChat.agent_id
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {new Date(message.sent_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-lg">Select a chat to view details</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard

