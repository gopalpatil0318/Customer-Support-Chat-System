import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'agent' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  token: string | null;
  login: (email: string, password: string, role: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: string, product_name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:3000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token,setToekn ] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_URL}/user`, { withCredentials: true });
        console.log(response.data.user)
        setUser(response.data.user);
        setToekn(response.data.token);
        
      } catch (err) {
        setError('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string, role: string) => {
    try {
      const response = await axios.post(`${API_URL}/signin`, { email, password, role }, { withCredentials: true });
      setUser(response.data.user);
      setToekn(response.data.token);
      
    } catch (err) {
      setError('Failed to login');
      throw err;
    }
  };

  const signup = async (name: string, email: string, password: string, role: string, product_name?: string) => {
    try {
      const response = await axios.post(`${API_URL}/signup`, { name, email, password, role, product_name }, { withCredentials: true });
      setUser(response.data.user);
      setToekn(response.data.token);
    } catch (err) {
      setError('Failed to sign up');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
      setUser(null);
    } catch (err) {
      setError('Failed to logout');
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout,token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

