import axios from 'axios';
import { SignUpData, SignInData, AuthResponse } from '../types/auth';

const API_URL = 'http://localhost:3000/api';

export const authService = {
  async signUp(data: SignUpData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/signup`, data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async signIn(data: SignInData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/signin`, data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await axios.post(`${API_URL}/logout`);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
};

