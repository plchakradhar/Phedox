import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Explicitly purge legacy tokens so clean authentication is required
      localStorage.removeItem('onlineoffers_token');
      localStorage.removeItem('onlineoffers_user');

      const savedToken = localStorage.getItem('phedox_token');
      const savedUser = localStorage.getItem('phedox_user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setAdmin(JSON.parse(savedUser));
      } else {
        setToken(null);
        setAdmin(null);
      }
    } catch (e) {
      console.error('Failed to load session from localStorage', e);
      setToken(null);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const response = await authApi.login(username, password);
    if (response && response.token) {
      setToken(response.token);
      const userData = {
        username: response.username || username,
        role: response.role || 'ROLE_ADMIN',
      };
      setAdmin(userData);
      localStorage.setItem('phedox_token', response.token);
      localStorage.setItem('phedox_user', JSON.stringify(userData));
      return response;
    }
    throw new Error('Authentication failed');
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('phedox_token');
    localStorage.removeItem('phedox_user');
    localStorage.removeItem('onlineoffers_token');
    localStorage.removeItem('onlineoffers_user');
  };

  const value = {
    admin,
    token,
    isAuthenticated: !!token && !!admin,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
