import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Customer {
  id: number;
  name: string;
  query: string;
  status: 'active' | 'waiting';
}

interface Message {
  id: number;
  sender: 'user' | 'agent';
  content: string;
  timestamp: string;
}



const AgentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
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

  const customers: Customer[] = [
    { id: 1, name: 'Anjali Patil', query: 'Product inquiry', status: 'active' },
    { id: 2, name: 'Rahul Chaudhari', query: 'Billing issue', status: 'waiting' },
    { id: 3, name: 'Sanjay Patil', query: 'Technical support', status: 'active' },
    { id: 4, name: 'Kavya Chaudhari', query: 'Return request', status: 'waiting' },
    { id: 5, name: 'Rohit Bhamare', query: 'Delivery issue', status: 'active' },
    { id: 6, name: 'Meera Patil', query: 'Account setup', status: 'waiting' },
    { id: 7, name: 'Aarav Bhamare', query: 'Feedback submission', status: 'active' },
    { id: 8, name: 'Ishita Chaudhari', query: 'Warranty claim', status: 'waiting' },
    { id: 9, name: 'Vikram Patil', query: 'Payment query', status: 'active' },
    { id: 10, name: 'Sneha Chaudhari', query: 'Shipping inquiry', status: 'waiting' },
  ];
  

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setMessages([]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      sender: 'agent',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages([...messages, newMessage]);
    setInputMessage('');

    setTimeout(() => {
      const customerResponse: Message = {
        id: messages.length + 2,
        sender: 'user',
        content: `This is a simulated response from ${selectedCustomer?.name}.`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prevMessages) => [...prevMessages, customerResponse]);
    }, 1000);
  };

  return (
    <div className="container mx-auto p-4">
      <header className="bg-white shadow mb-4">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Agent Support Dashboard</h1>
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
          <h2 className="text-xl font-semibold mb-2">Customer Queries</h2>
          <p className="text-sm text-gray-600 mb-4">Select a customer to start chatting</p>
          <div className="h-[500px] overflow-y-auto">
            {customers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => handleCustomerSelect(customer)}
                className={`w-full flex items-center justify-between p-2 mb-2 rounded ${
                  selectedCustomer?.id === customer.id ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                    {customer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="text-left">
                    <div>{customer.name}</div>
                    <div className="text-xs text-gray-600">
                      {customer.query} • {customer.status}
                    </div>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  customer.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">
            {selectedCustomer ? `Chat with ${selectedCustomer.name}` : 'Select a customer'}
          </h2>
          <div className="h-[400px] mb-4 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-2 ${
                  message.sender === 'agent' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block p-2 rounded-lg ${
                    message.sender === 'agent' ? 'bg-blue-500 text-white' : 'bg-gray-200'
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
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;