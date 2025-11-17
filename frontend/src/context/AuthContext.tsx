import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, TokenResponse } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await api.get<User>('/auth/me');
          // Добавляем время входа при загрузке из localStorage
          setUser({
            ...response.data,
            loginTime: Number(localStorage.getItem('loginTime')) || Date.now()
          });
        } catch (error) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('loginTime');
          setUser(null);
        }
      }
    };
    loadUser();
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const response = await api.post<TokenResponse>('/auth/login', params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);

      // Сохраняем время входа
      const loginTime = Date.now();
      localStorage.setItem('loginTime', loginTime.toString());

      const userResponse = await api.get<User>('/auth/me');
      setUser({
        ...userResponse.data,
        loginTime
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('loginTime');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};