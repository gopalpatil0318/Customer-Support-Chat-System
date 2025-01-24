import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';

const API_URL = 'http://localhost:3000/api';
const SOCKET_URL = 'http://localhost:3000';

interface ChatSession {
  id: number;
  agent: string;
  customer: string;
  startTime: string;
  status: 'active' | 'resolved';
  product: string;
  messages: { sender: 'admin' | 'agent' | 'customer'; content: string; timestamp: string }[];
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, { withCredentials: true });
    setSocket(newSocket);

    fetchAllChats();

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new_chat_session', handleNewChatSession);
      socket.on('query_resolved', handleQueryResolved);

      return () => {
        socket.off('new_chat_session');
        socket.off('query_resolved');
      };
    }
  }, [socket]);

  const fetchAllChats = async () => {
    try {
      const response = await axios.get(`${API_URL}/chats`, { withCredentials: true });
      setChatSessions(response.data.chats);
    } catch (error) {
      console.error('Failed to fetch all chats:', error);
    }
  };

  const handleNewChatSession = () => {
    fetchAllChats();
  };

  const handleQueryResolved = (data: { chatSessionId: number }) => {
    setChatSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === data.chatSessionId ? { ...session, status: 'resolved' } : session
      )
    );
  };

  const openChatView = (session: ChatSession) => {
    setSelectedSession(session);
  };

  const closeChatView = () => {
    setSelectedSession(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <header className="bg-white shadow mb-4">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center">
            <span className="mr-4 text-gray-700">{user?.name} ({user?.role})</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-2">Active Chat Sessions</h2>
        <p className="text-sm text-gray-600 mb-4">Overview of all ongoing and completed chat sessions</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Agent</th>
                <th className="p-2 text-left">Customer</th>
                <th className="p-2 text-left">Start Time</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {chatSessions.map((session) => (
                <tr key={session.id} className="border-b">
                  <td className="p-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                        {session.agent.split(' ').map(n => n[0]).join('')}
                      </div>
                      {session.agent}
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                        {session.customer.split(' ').map(n => n[0]).join('')}
                      </div>
                      {session.customer}
                    </div>
                  </td>
                  <td className="p-2">{session.startTime}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      session.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="p-2">{session.product}</td>
                  <td className="p-2">
                    <button 
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                      onClick={() => openChatView(session)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Chat Session Details</h3>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <div className="mb-4">
                <p><strong>Agent:</strong> {selectedSession.agent}</p>
                <p><strong>Customer:</strong> {selectedSession.customer}</p>
                <p><strong>Start Time:</strong> {selectedSession.startTime}</p>
                <p><strong>Status:</strong> {selectedSession.status}</p>
                <p><strong>Product:</strong> {selectedSession.product}</p>
              </div>
              <div className="space-y-2">
                {selectedSession.messages.map((message, index) => (
                  <div key={index} className={`p-2 rounded-lg ${
                    message.sender === 'admin' ? 'bg-blue-100 text-blue-800' :
                    message.sender === 'agent' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="font-semibold">{message.sender.charAt(0).toUpperCase() + message.sender.slice(1)}</p>
                    <p>{message.content}</p>
                    <p className="text-xs text-gray-500">{message.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t">
              <button 
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                onClick={closeChatView}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;