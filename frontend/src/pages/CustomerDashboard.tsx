import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSupportChat } from "../context/SupportChatContext";
import axios from "axios";

const API_URL = "http://localhost:3000/api";

export interface Agent {
  id: number;
  name: string;
  status: "online" | "offline";
}

export interface Message {
  id: number;
  sender_id: number;
  message: string;
  sent_at: string;
}

export interface User {
  id: number;
  name: string;
  role: string;
}

const CustomerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    messages,
    setChatSessionId,
    isTyping,
    inputMessage,
    socket,
    handleSendMessage,
    handleInputChange,
    fetchMessages,
  } = useSupportChat();
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

 
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("agent_status_change", handleAgentStatusChange);

      return () => {
        socket.off("agent_status_change");
      };
    }
  }, [socket]);

  const fetchAgents = async () => {
    try {
      const response = await axios.get(`${API_URL}/agents`, { withCredentials: true });
      setAgents(response.data.agents);
    } catch (error) {
      console.error("Failed to fetch agents:", error);
    }
  };

  const handleAgentStatusChange = (data: { agentId: number; status: "online" | "offline" }) => {
    setAgents((prev) =>
      prev.map((agent) => (agent.id === data.agentId ? { ...agent, status: data.status } : agent))
    );
  };

  const handleAgentSelect = async (agent: Agent) => {
    setSelectedAgent(agent);
    try {
      const response = await axios.post(
        `${API_URL}/chat/initiate`,
        { agentId: agent.id },
        { withCredentials: true }
      );
      const newChatSessionId = response.data.chatSessionId;
      setChatSessionId(newChatSessionId);
      await fetchMessages(newChatSessionId);
    } catch (error) {
      console.error("Failed to initiate chat session:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <header className="bg-white shadow mb-4">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Customer Support Chat</h1>
          <div className="flex items-center">
            <span className="mr-4 text-gray-700">
              {user?.name} ({user?.role})
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-2">Available Agents</h2>
          <p className="text-sm text-gray-600 mb-4">Select an agent to start chatting</p>
          <div className="h-[500px] overflow-y-auto">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => handleAgentSelect(agent)}
                className={`w-full flex items-center justify-between p-2 mb-2 rounded ${
                  agent.status === "offline" ? "opacity-50 cursor-not-allowed" : " "
                } ${selectedAgent?.id === agent.id ? "bg-gray-200" : "hover:bg-gray-100"}`}
                disabled={agent.status === "offline"}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-2 overflow-hidden">
                    <img
                      src={`https://avatar.iran.liara.run/public/boy?username=${agent.name}`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <div>{agent.name}</div>
                    <div className="text-xs text-gray-600">{agent.status}</div>
                  </div>
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${
                    agent.status === "online" ? "bg-green-500" : "bg-gray-500"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">
            {selectedAgent ? `Chat with ${selectedAgent.name}` : "Select an agent"}
          </h2>
          <div className="h-[400px] mb-4 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-2 ${message.sender_id === (user as User).id ? "text-right" : "text-left"}`}
              >
                <div
                  className={`inline-block p-2 rounded-lg ${
                    message.sender_id === (user as User).id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {message.message}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(message.sent_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-sm text-gray-500 italic">{selectedAgent?.name} is typing...</div>}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={handleInputChange}
              disabled={!selectedAgent}
              className="flex-grow p-2 border rounded"
            />
            <button
              type="submit"
              disabled={!selectedAgent}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
