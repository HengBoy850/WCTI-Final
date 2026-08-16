import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('pos_token'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('pos_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      if (token) {
        try {
          const { user } = await api.me(token);
          if (['admin', 'staff', 'cashier'].includes(user.role)) {
            setUser(user);
            localStorage.setItem('pos_user', JSON.stringify(user));
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    }
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function login(token, user) {
    localStorage.setItem('pos_token', token);
    localStorage.setItem('pos_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  }

  function updateUser(user) {
    localStorage.setItem('pos_user', JSON.stringify(user));
    setUser(user);
  }

  function logout() {
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
