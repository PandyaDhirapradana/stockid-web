import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const UserAuthContext = createContext(null);

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('userToken');
    if (!token) { setLoading(false); return; }
    try {
      const res = await api.get('/user/auth/me');
      setUser(res.data.data);
    } catch {
      localStorage.removeItem('userToken');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const register = async (name, email, phone, password, equity, tradingExperience) => {
    const res = await api.post('/user/auth/register', {
      name, email, phone, password, equity, tradingExperience,
    });
    localStorage.setItem('userToken', res.data.data.token);
    setUser(res.data.data.user);
    return res.data.data.user;
  };

  // Login support email atau phone
  const login = async (identifier, password, loginMethod = 'email') => {
    const res = await api.post('/user/auth/login', { identifier, password, loginMethod });
    localStorage.setItem('userToken', res.data.data.token);
    setUser(res.data.data.user);
    return res.data.data.user;
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/user/auth/me');
      setUser(res.data.data);
    } catch {}
  };

  return (
    <UserAuthContext.Provider value={{ user, loading, register, login, logout, refreshUser }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error('useUserAuth must be used within UserAuthProvider');
  return ctx;
};