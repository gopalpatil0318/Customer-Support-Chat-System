import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Agent {
  id: number;
  name: string;
  type: 'general' | 'training' | 'exam';
  status: 'online' | 'offline';
}

interface Message {
  id: number;
  sender: 'user' | 'agent';
  content: string;
  timestamp: string;
}

const CustomerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  const agents: Agent[] = [
    { id: 1, name: 'Arjun Patil', type: 'general', status: 'online' },
    { id: 2, name: 'Priya Bichave', type: 'general', status: 'online' },
    { id: 3, name: 'Ravi Patil', type: 'training', status: 'online' },
    { id: 4, name: 'Neha Chaudhari', type: 'training', status: 'offline' },
    { id: 5, name: 'Karan Patil', type: 'exam', status: 'online' },
    { id: 6, name: 'Pooja Bhamare', type: 'exam', status: 'online' },
    { id: 7, name: 'Prajakta Patil', type: 'exam', status: 'offline' },
  ];
  

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    setMessages([]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages([...messages, newMessage]);
    setInputMessage('');

    setTimeout(() => {
      const agentResponse: Message = {
        id: messages.length + 2,
        sender: 'agent',
        content: `This is a simulated response from ${selectedAgent?.name}.`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prevMessages) => [...prevMessages, agentResponse]);
    }, 1000);
  };

  return (
    <div className="container mx-auto p-4">
      <header className="bg-white shadow mb-4">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Customer Support Chat</h1>
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
                  agent.status === 'offline' ? 'opacity-50 cursor-not-allowed' : ''
                } ${selectedAgent?.id === agent.id ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                disabled={agent.status === 'offline'}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                    {agent.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="text-left">
                    <div>{agent.name}</div>
                    <div className="text-xs text-gray-600">
                      {agent.type} • {agent.status}
                    </div>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  agent.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                }`} />
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">
            {selectedAgent ? `Chat with ${selectedAgent.name}` : 'Select an agent'}
          </h2>
          <div className="h-[400px] mb-4 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-2 ${
                  message.sender === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block p-2 rounded-lg ${
                    message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  {message.content}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {message.timestamp}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
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