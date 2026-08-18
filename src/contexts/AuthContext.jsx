import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authService from '../services/neonAuth';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Manter a sessão ativa: buscar do localStorage ou da sessão do Neon
    const storedUser = localStorage.getItem('@NatuNutri:user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      localStorage.setItem('@NatuNutri:user', JSON.stringify(response.user));
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (name, email, password) => {
    try {
      const response = await authService.register(name, email, password);
      setUser(response.user);
      localStorage.setItem('@NatuNutri:user', JSON.stringify(response.user));
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    await authService.logout();
    setUser(null);
    localStorage.removeItem('@NatuNutri:user');
  };

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
