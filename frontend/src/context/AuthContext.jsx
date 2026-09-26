import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 'USR001',
    name: 'Super Admin',
    email: 'admin@safedrive.ai',
    role: 'SUPER_ADMIN',
    organization_id: 'ORG001'
  });
  const [token, setToken] = useState(localStorage.getItem('safedrive_token') || 'demo_jwt_token_123');
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('safedrive_token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('safedrive_token');
  };

  const switchRole = (newRole) => {
    setUser(prev => ({ ...prev, role: newRole }));
  };

  const toggleTheme = () => setDarkMode(prev => !prev);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, switchRole, darkMode, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
