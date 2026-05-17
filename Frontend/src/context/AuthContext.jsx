import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  useEffect(() => {
    const storedUser = localStorage.getItem('vault_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('vault_token', token);
    localStorage.setItem('vault_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    localStorage.removeItem('vault_token');
    localStorage.removeItem('vault_user');
    setUser(null);
    window.location.reload(); // Simple way to clear all states
  };

  const openLogin = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const openSignup = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  const closeAuth = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser,
      isAuthModalOpen, 
      authMode, 
      setAuthMode,
      openLogin, 
      openSignup, 
      closeAuth, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
