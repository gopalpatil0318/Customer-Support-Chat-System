  import React, { useState, useEffect, useCallback, useRef } from "react";
  import { useNavigate } from "react-router-dom";
  import { useAuth } from "../context/AuthContext";
  import { useSupportChat } from "../context/SupportChatContext";
  import axios from "axios";

  const API_URL = "http://localhost:3000/api";

  export interface Customer {
    chat_session_id: number;
    customer_id: number;
    customer_name: string;
    status: "active" | "resolved";
    online_status: "online" | "offline";
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

  const AgentDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const {
      messages,
      setMessages,
      setChatSessionId,
      isTyping,
      inputMessage,
      socket,
      handleSendMessage,
      handleInputChange,
      fetchMessages,
    } = useSupportChat();
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to the bottom of the chat window
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
      scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
      fetchCustomers();
    }, []);

    useEffect(() => {
      if (socket && user) {
        socket.emit("join_agent_room", user.id);
        socket.on("new_chat_session", handleNewChatSession);
        socket.on("customer_status_change", handleCustomerStatusChange);

        return () => {
          socket.off("new_chat_session");
          socket.off("customer_status_change");
        };
      }
    }, [socket, user]);

    const fetchCustomers = async () => {
      try {
        const response = await axios.get(`${API_URL}/customer-queries`, { withCredentials: true });
        setCustomers(response.data.customerQueries);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      }
    };

    const handleNewChatSession = useCallback(() => {
      fetchCustomers();
    }, []);

    const handleCustomerStatusChange = useCallback((data: { customerId: number; status: "online" | "offline" }) => {
      setCustomers((prevCustomers) =>
        prevCustomers.map((customer) =>
          customer.customer_id === data.customerId ? { ...customer, online_status: data.status } : customer
        )
      );
    }, []);

    const handleCustomerSelect = async (customer: Customer) => {
      setSelectedCustomer(customer);
      setChatSessionId(customer.chat_session_id);
      await fetchMessages(customer.chat_session_id);
      socket.emit("join_chat", customer.chat_session_id);
    };

    const handleResolveQuery = async () => {
      if (!selectedCustomer) return;

      try {
        await axios.post(
          `${API_URL}/chat/resolve`,
          { chatSessionId: selectedCustomer.chat_session_id },
          { withCredentials: true }
        );
        setCustomers((prevCustomers) =>
          prevCustomers.map((customer) =>
            customer.chat_session_id === selectedCustomer.chat_session_id
              ? { ...customer, status: "resolved" }
              : customer
          )
        );
        setSelectedCustomer(null);
        setChatSessionId(null);
        setMessages([]);
      } catch (error) {
        console.error("Failed to resolve query:", error);
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
            <h1 className="text-3xl font-bold text-gray-900">Agent Support Dashboard</h1>
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
            <h2 className="text-xl font-semibold mb-2">Customer Queries</h2>
            <p className="text-sm text-gray-600 mb-4">Select a customer to start chatting</p>
            <div className="h-[500px] overflow-y-auto">
              {customers.map((customer) => (
                <button
                  key={customer.customer_id}
                  onClick={() => handleCustomerSelect(customer)}
                  className={`w-full flex items-center justify-between p-2 mb-2 rounded ${
                    selectedCustomer?.chat_session_id === customer.chat_session_id ? "bg-gray-200" : "hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                      <img
                        src={`https://avatar.iran.liara.run/public/boy?username=${customer.customer_name}`}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <div>{customer.customer_name}</div>
                      <div className="text-xs text-gray-600">
                        Session ID: {customer.chat_session_id} • {customer.status} • {customer.online_status}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      customer.online_status === "online" ? "bg-green-500" : "bg-gray-500"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">
              {selectedCustomer ? `Chat with ${selectedCustomer.customer_name}` : "Select a customer"}
            </h2>
            <div className="h-[400px] mb-4 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-2 ${message.sender_id === (user as User).id ? "text-right" : "text-left"}`}
                >
                  <div
                    className={`inline-block p-2 rounded-lg ${
                      message.sender_id === (user as User).id ? "bg-blue-500 text-white" : "bg-gray-200"
                    }`}
                  >
                    {message.message}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(message.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="text-sm text-gray-500 italic">{selectedCustomer?.customer_name} is typing...</div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={handleInputChange}
                disabled={!selectedCustomer}
                className="flex-grow p-2 border rounded"
              />
              <button
                type="submit"
                disabled={!selectedCustomer}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
              >
                Send
              </button>
            </form>
            {selectedCustomer && (
              <button
                onClick={handleResolveQuery}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Resolve Query
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  export default AgentDashboard;
