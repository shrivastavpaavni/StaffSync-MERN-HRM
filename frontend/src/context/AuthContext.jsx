import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('staffsync_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.data.success) {
            setUser(res.data.user);
            setEmployee(res.data.employee);
          }
        } catch (error) {
          console.error('Session expired or invalid:', error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.data.success) {
      localStorage.setItem('staffsync_token', res.data.token);
      localStorage.setItem('staffsync_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      setEmployee(res.data.employee);
      return res.data;
    }
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.data.success) {
      localStorage.setItem('staffsync_token', res.data.token);
      localStorage.setItem('staffsync_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      setEmployee(res.data.employee);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('staffsync_token');
    localStorage.removeItem('staffsync_user');
    setToken(null);
    setUser(null);
    setEmployee(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.data.success) {
        setUser(res.data.user);
        setEmployee(res.data.employee);
      }
    } catch (err) {
      console.error('Error refreshing user details:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        employee,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isHR: user?.role === 'hr',
        isManager: user?.role === 'manager' || user?.role === 'hr',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
