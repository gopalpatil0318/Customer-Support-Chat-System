import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useSupportChat } from "../context/SupportChatContext"
import axios from "axios"
import { LogOut, Send, CheckCircle, Search } from "lucide-react"
import Chatbot from "../components/AiChatBot"

const API_URL = "http://localhost:3000/api"

export interface Agent {
  id: number
  name: string
  product_name: string
  status: "online" | "offline"
}

export interface Message {
  id: number
  sender_id: number
  message: string
  sent_at: string
}

export interface User {
  id: number
  name: string
  role: string
}

const CustomerDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const {
    messages,
    setChatSessionId,
    chatSessionId,
    chatStatus,
    setChatStatus,
    isTyping,
    inputMessage,
    socket,
    handleSendMessage,
    handleInputChange,
    fetchMessages,
  } = useSupportChat()
  const navigate = useNavigate()
  const [agents, setAgents] = useState<Agent[]>([])
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, messagesEndRef, scrollToBottom]) 

  useEffect(() => {
    fetchAgents()
  }, [])

  useEffect(() => {
    const filtered = agents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.product_name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredAgents(filtered)
  }, [searchQuery, agents])

  useEffect(() => {
    if (socket) {
      socket.on("getOnlineUsers", (onlineUserIds: any) => {
        setAgents((prevAgents) =>
          prevAgents.map((agent) =>
            onlineUserIds.map(Number).includes(agent.id)
              ? { ...agent, status: "online" }
              : { ...agent, status: "offline" },
          ),
        )
      })

      socket.on("query_resolved", (data: any) => {
        if (data.chatSessionId === chatSessionId) {
          setChatStatus("resolved")
        }
      })
      socket.on("query_active", (data: any) => {
        if (data.chatSessionId === chatSessionId) {
          setChatStatus("active")
        }
      })

      return () => {
        socket.off("getOnlineUsers")
        socket.off("query_resolved")
        socket.off("query_active")
      }
    }
  }, [socket, chatSessionId])

  const fetchAgents = async () => {
    try {
      const response = await axios.get(`${API_URL}/agents`, { withCredentials: true })
      const agentsWithStatus = response.data.agents.map((agent: { status: any }) => ({
        ...agent,
        status: agent.status || "offline",
      }))
      setAgents(agentsWithStatus)
      setFilteredAgents(agentsWithStatus)
    } catch (error) {
      console.error("Failed to fetch agents:", error)
    }
  }

  const handleAgentSelect = async (agent: Agent) => {
    setSelectedAgent(agent)
    setIsSidebarOpen(false)
    try {
      const response = await axios.post(`${API_URL}/chat/initiate`, { agentId: agent.id }, { withCredentials: true })
      const newChatSessionId = response.data.chatSessionId
      setChatSessionId(newChatSessionId)
      await fetchMessages(newChatSessionId)
    } catch (error) {
      console.error("Failed to initiate chat session:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      socket.off("getOnlineUsers")
      navigate("/")
    } catch (error) {
      console.error("Failed to logout", error)
    }
  }

  const handleResolveChat = async () => {
    try {
      await axios.post(`${API_URL}/chat/resolve`, { chatSessionId: chatSessionId }, { withCredentials: true })
      setChatStatus("resolved")
    } catch (error) {
      console.error("Failed to resolve chat:", error)
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <Chatbot />
   
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-lg"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>

   
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative w-full md:w-1/4 h-full bg-white border-r border-gray-200 overflow-y-auto transition-transform duration-200 ease-in-out z-40`}
      >
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">Customer Support</h1>
          <div className="mt-4 relative">
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 pl-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="p-4">
          <h2 className="text-lg font-medium text-gray-700 mb-2">Available Agents</h2>
          {filteredAgents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => handleAgentSelect(agent)}
              className={`w-full flex items-center p-3 mb-2 rounded-lg transition-colors duration-200 ${
                agent.status === "offline" ? "opacity-50 cursor-not-allowed" : ""
              } ${selectedAgent?.id === agent.id ? "bg-blue-100" : "hover:bg-gray-100"}`}
              disabled={agent.status === "offline"}
            >
              <div className="relative">
                <img
                  src={`https://avatar.iran.liara.run/public/boy?username=${agent.name}`}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    agent.status === "online" ? "bg-green-500" : "bg-gray-500"
                  }`}
                />
              </div>
              <div className="ml-3 text-left">
                <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                <div className="text-xs text-gray-500">{agent.product_name}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      
      <div className="flex-1 flex flex-col h-screen">
        <header className="bg-white shadow-sm flex-shrink-0 p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">{selectedAgent ? `Chat with ${selectedAgent.name}` : "Select a Agent"}</h2>
            <div className="flex items-center">
            <span className="mr-4 text-sm text-gray-700">
                {user?.name} ({user?.role})
              </span>
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
          <div className="max-w-3xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${message.sender_id === (user as User).id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl p-3 rounded-lg ${
                    message.sender_id === (user as User).id ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <p className="text-sm break-words">{message.message}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {new Date(message.sent_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-200 text-gray-800 p-3 rounded-lg">
                  <p className="text-sm italic">{selectedAgent?.name} is typing...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>
        <footer className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
          
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={handleInputChange}
                disabled={!selectedAgent}
                className="flex-grow p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!selectedAgent}
                className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <div className="flex justify-between items-center mt-2">
              <div className="text-sm text-gray-500">
                Chat Status:{" "}
                <span className={`font-medium ${chatStatus === "active" ? "text-green-600" : "text-gray-600"}`}>
                  {chatStatus}
                </span>
              </div>
              {chatStatus !== "resolved" && (
                <button
                  onClick={handleResolveChat}
                  className="text-sm bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                  disabled={!selectedAgent}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Resolve Chat
                </button>
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default CustomerDashboard

