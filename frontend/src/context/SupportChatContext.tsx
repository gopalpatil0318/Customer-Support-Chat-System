import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import axios from "axios"
import io from "socket.io-client"
import { useAuth } from "./AuthContext"

const API_URL = "http://localhost:3000/api"
const SOCKET_URL = "http://localhost:3000"

interface User {
  id: number
  name: string
  role: string
}

interface Message {
  id: number
  sender_id: number
  message: string
  sent_at: string
}

interface SupportChatContextType {
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  chatSessionId: number | null
  setChatSessionId: React.Dispatch<React.SetStateAction<number | null>>
  isTyping: boolean
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>
  inputMessage: string
  chatStatus: string | null;
  setChatStatus: React.Dispatch<React.SetStateAction<string | null>>;
  setInputMessage: React.Dispatch<React.SetStateAction<string>>
  socket: any
  handleSendMessage: (e: React.FormEvent) => Promise<void>
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  fetchMessages: (sessionId: number) => Promise<void>
}

const SupportChatContext = createContext<SupportChatContextType | undefined>(undefined)

export const useSupportChat = () => {
  const context = useContext(SupportChatContext)
  if (!context) {
    throw new Error("useSupportChat must be used within a SupportChatProvider")
  }
  return context
}

export const SupportChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, token } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [chatSessionId, setChatSessionId] = useState<number | null>(null)
  const [chatStatus, setChatStatus] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)

  const [inputMessage, setInputMessage] = useState("")
  const [socket, setSocket] = useState<any>(null)

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      query: { token },
      withCredentials: true,
    })
    setSocket(newSocket)

    return () => {
      newSocket.off()
      newSocket.disconnect()
    }
  }, [token])

  useEffect(() => {
    if (socket && chatSessionId) {
      socket.emit("join_chat", chatSessionId)

      socket.on("new_message", handleNewMessage)
      socket.on("typing_status", (data: { chatSessionId: number; userId: number; isTyping: boolean }) => {
        if (data.chatSessionId === chatSessionId) {
          setIsTyping(data.isTyping);
        }
      });

      return () => {
        socket.off("new_message")
        socket.off("typing_status")
      }
    }
  }, [socket, chatSessionId])

  const handleNewMessage = (message: Message) => {
    setMessages((prev) => [...prev, { ...message, id: message.id || Date.now() }])
  }



  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || !chatSessionId) return
    setIsTyping(false)
    socket.emit("typing", { chatSessionId, isTyping: false })
    try {
      const response = await axios.post(
        `${API_URL}/chat/message`,
        { chatSessionId, message: inputMessage },
        { withCredentials: true },
      )

      const newMessage: Message = {
        id: response.data.messageId,
        sender_id: (user as User).id,
        message: inputMessage,
        sent_at: new Date().toISOString(),
      }
      setChatStatus("active")
      setMessages((prev) => [...prev, newMessage])

      socket.emit("send_message", { chatSessionId, message: newMessage })
      setInputMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value)
    if (chatSessionId) {
      socket.emit("typing", { chatSessionId, isTyping: e.target.value.length > 0 })
    }
  }

  const fetchMessages = async (sessionId: number) => {
    try {
      const response = await axios.get(`${API_URL}/chat/${sessionId}/messages`, {
        withCredentials: true,
      })
      console.log("sessionId",sessionId)
      console.log(response.data.status)
      console.log(response.data.messages)
      setChatStatus(response.data.status)
      setMessages(response.data.messages)

    } catch (error) {
      console.error("Failed to fetch messages:", error)
    }
  }

  const value = {
    messages,
    setMessages,
    chatStatus,
    setChatStatus,
    chatSessionId,
    setChatSessionId,
    isTyping,
    setIsTyping,
    inputMessage,
    setInputMessage,
    socket,
    handleSendMessage,
    handleInputChange,
    fetchMessages,
  }

  return <SupportChatContext.Provider value={value}>{children}</SupportChatContext.Provider>
}

