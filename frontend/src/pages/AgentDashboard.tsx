import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useSupportChat } from "../context/SupportChatContext"
import axios from "axios"
import { LogOut, Send, User, Search } from "lucide-react"

const API_URL = "http://localhost:3000/api"

export interface Customer {
  chat_session_id: number
  customer_id: number
  customer_name: string
  status: "active" | "resolved"
  online_status: "online" | "offline"
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

const AgentDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const {
    messages,
    setChatSessionId,
    isTyping,
    inputMessage,
    socket,
    handleSendMessage,
    handleInputChange,
    fetchMessages,
  } = useSupportChat()
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, messagesEndRef]) // Added messagesEndRef to dependencies

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    const filtered = customers.filter((customer) =>
      customer.customer_name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredCustomers(filtered)
  }, [searchQuery, customers])

  useEffect(() => {
    if (socket && user) {
      const handleNewSession = () => {
        fetchCustomers()
      }

      const handleQueryResolved = (data: { chatSessionId: number }) => {
        setCustomers((prevCustomers) =>
          prevCustomers.map((customer) =>
            customer.chat_session_id === data.chatSessionId ? { ...customer, status: "resolved" } : customer,
          ),
        )

        if (selectedCustomer?.chat_session_id === data.chatSessionId) {
          setSelectedCustomer((prev) => (prev ? { ...prev, status: "resolved" } : null))
        }
      }

      const handleQueryActive = (data: { chatSessionId: number }) => {
        setCustomers((prevCustomers) =>
          prevCustomers.map((customer) =>
            customer.chat_session_id === data.chatSessionId ? { ...customer, status: "active" } : customer,
          ),
        )

        if (selectedCustomer?.chat_session_id === data.chatSessionId) {
          setSelectedCustomer((prev) => (prev ? { ...prev, status: "active" } : null))
        }
      }

      const handleOnlineUsers = (onlineUserIds: number[]) => {
        setCustomers((prevCustomers) =>
          prevCustomers.map((customer) =>
            onlineUserIds.map(Number).includes(customer.customer_id)
              ? { ...customer, online_status: "online" }
              : { ...customer, online_status: "offline" },
          ),
        )
      }

      socket.on("getOnlineUsers", handleOnlineUsers)
      socket.on("new_chat_session", handleNewSession)
      socket.on("query_resolved", handleQueryResolved)
      socket.on("query_active", handleQueryActive)

      return () => {
        socket.off("new_chat_session", handleNewSession)
        socket.off("getOnlineUsers", handleOnlineUsers)
        socket.off("query_resolved", handleQueryResolved)
        socket.off("query_active", handleQueryActive)
      }
    }
  }, [socket, user, selectedCustomer])

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/customer-queries`, { withCredentials: true })
      setCustomers(response.data.customerQueries)
      setFilteredCustomers(response.data.customerQueries)
    } catch (error) {
      console.error("Failed to fetch customers:", error)
    }
  }

  const handleCustomerSelect = async (customer: Customer) => {
    setSelectedCustomer(customer)
    setChatSessionId(customer.chat_session_id)
    await fetchMessages(customer.chat_session_id)
    socket.emit("join_chat", customer.chat_session_id)
    setIsSidebarOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
    } catch (error) {
      console.error("Failed to logout", error)
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">

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
          <h1 className="text-xl font-semibold text-gray-800">Agent Support</h1>
          <div className="mt-4 relative">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 pl-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="p-4">
          <h2 className="text-lg font-medium text-gray-700 mb-2">Customer Queries</h2>
          {filteredCustomers.map((customer) => (
            <button
              key={customer.customer_id}
              onClick={() => handleCustomerSelect(customer)}
              className={`w-full flex items-center p-3 mb-2 rounded-lg transition-colors duration-200 ${
                selectedCustomer?.chat_session_id === customer.chat_session_id ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
            >
              <div className="relative">
                <img
                  src={`https://avatar.iran.liara.run/public/boy?username=${customer.customer_name}`}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    customer.online_status === "online" ? "bg-green-500" : "bg-gray-500"
                  }`}
                />
              </div>
              <div className="ml-3 text-left">
                <div className="text-sm font-medium text-gray-900">{customer.customer_name}</div>
                <div className={`text-xs ${customer.status === "active" ? "text-green-600" : "text-gray-500"}`}>
                  {customer.status}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

     
      <div className="flex-1 flex flex-col h-screen">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-medium text-gray-900">
              {selectedCustomer ? `Chat with ${selectedCustomer.customer_name}` : "Select a customer"}
            </h2>
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
                  <p className="text-sm italic">{selectedCustomer?.customer_name} is typing...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>
        <footer className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={handleInputChange}
                disabled={!selectedCustomer || selectedCustomer.status === "resolved"}
                className="flex-grow p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!selectedCustomer || selectedCustomer.status === "resolved"}
                className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <div className="flex justify-between items-center mt-2">
              <div className="text-sm text-gray-500">
                Chat Status:{" "}
                <span
                  className={`font-medium ${selectedCustomer?.status === "active" ? "text-green-600" : "text-gray-600"}`}
                >
                  {selectedCustomer?.status || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default AgentDashboard

