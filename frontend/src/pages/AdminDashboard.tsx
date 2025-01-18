import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ChatSession {
  id: number;
  agent: string;
  customer: string;
  startTime: string;
  status: 'active' | 'completed';
  product: string;
  messages: { sender: 'admin' | 'agent' | 'customer'; content: string; timestamp: string }[];
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [chatSessions] = useState<ChatSession[]>([
    { 
      id: 1, 
      agent: 'Rahul Sharma', 
      customer: 'Gopal Patil', 
      startTime: '10:00 AM', 
      status: 'active',

      product: 'Traning and Placement',
      messages: [
        { sender: 'customer', content: 'Hello, I need help with my account.', timestamp: '10:01 AM' },
        { sender: 'agent', content: 'Hi Gopal, I\'d be happy to help. What seems to be the issue?', timestamp: '10:02 AM' },
        { sender: 'customer', content: 'I can\'t log in to my account.', timestamp: '10:03 AM' },
        { sender: 'agent', content: 'I see. Let\'s try resetting your password. I\'ll guide you through the process.', timestamp: '10:04 AM' },
      ]
    },
    { 
      id: 2, 
      agent: 'Priya Desai', 
      customer: 'Amit Kumar', 
      startTime: '10:15 AM', 
      status: 'active',
   
      product: 'Genral',
      messages: [
        { sender: 'customer', content: 'Hi, I\'m having trouble with the new software update.', timestamp: '10:16 AM' },
        { sender: 'agent', content: 'Hello Amit, I\'m here to assist you. Can you describe the issue you\'re facing?', timestamp: '10:17 AM' },
        { sender: 'customer', content: 'The application keeps crashing after the update.', timestamp: '10:18 AM' },
        { sender: 'agent', content: 'I understand. Let\'s start by checking your system specifications and then we\'ll troubleshoot step by step.', timestamp: '10:19 AM' },
      ]
    },
    { 
      id: 3, 
      agent: 'Vikram Patel', 
      customer: 'Neha Gupta', 
      startTime: '09:45 AM', 
      status: 'completed',
      product: 'Traning and Placement',
      messages: [
        { sender: 'customer', content: 'Good morning, I\'d like to know about your latest offers.', timestamp: '09:46 AM' },
        { sender: 'agent', content: 'Good morning Neha! I\'d be delighted to inform you about our current promotions.', timestamp: '09:47 AM' },
        { sender: 'customer', content: 'Great, I\'m particularly interested in your premium services.', timestamp: '09:48 AM' },
        { sender: 'agent', content: 'Excellent choice! Let me walk you through our premium service packages and their benefits.', timestamp: '09:49 AM' },
      ]
    },
    { 
      id: 4, 
      agent: 'Ananya Singh', 
      customer: 'Rajesh Khanna', 
      startTime: '10:30 AM', 
      status: 'active',
      product: 'Quize App',
      messages: [
        { sender: 'customer', content: 'Hello, I\'m considering upgrading my current plan.', timestamp: '10:31 AM' },
        { sender: 'agent', content: 'Hello Rajesh, that\'s great to hear! I\'d be happy to discuss our upgrade options with you.', timestamp: '10:32 AM' },
        { sender: 'customer', content: 'What additional features would I get with the next tier?', timestamp: '10:33 AM' },
        { sender: 'agent', content: 'Great question! Let me outline the key benefits and features of our higher-tier plans for you.', timestamp: '10:34 AM' },
      ]
    },
  ]);

  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  const openChatView = (session: ChatSession) => {
    setSelectedSession(session);
  };

  const closeChatView = () => {
    setSelectedSession(null);
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