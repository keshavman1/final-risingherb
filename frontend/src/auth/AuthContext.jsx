// frontend/src/auth/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { setAuthToken } from '../services/api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

function parseJwt(token) {
  if (!token) return null;
  try {
    const b = token.split('.')[1];
    // atob available in browser
    return JSON.parse(atob(b));
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => parseJwt(localStorage.getItem('token')) || null);
  const [loading, setLoading] = useState(false);

  // initialize axios header if token exists
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      setAuthToken(token);
      setUser(parseJwt(token));
    } else {
      localStorage.removeItem('token');
      setAuthToken(null);
      setUser(null);
    }
  }, [token]);

  // signup: call backend, store token
  const signup = async (payload) => {
    // payload: { name, email, phone, password }
    const res = await api.post('/auth/signup', payload);
    // backend returns { token, user } per our server
    const t = res.data?.token;
    if (t) setToken(t);
    return res.data;
  };

  // login: call backend, store token
  const login = async (payload) => {
    const res = await api.post('/auth/login', payload);
    const t = res.data?.token;
    if (t) setToken(t);
    return res.data;
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, signup, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
