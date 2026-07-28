import React, { createContext, useState, useEffect } from 'react';
import { loginUser, getMe } from '../services/authService';
import { speakWelcomeGreeting } from '../utils/voiceGreeting';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pustak_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const data = await getMe();
          setUser(data.user);
          speakWelcomeGreeting(data.user);
        } catch (err) {
          console.error('[Auth Error]: Failed to fetch user', err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    localStorage.setItem('pustak_token', data.token);
    setToken(data.token);
    setUser(data.user);
    sessionStorage.removeItem('ems_welcome_played');
    speakWelcomeGreeting(data.user, true);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('pustak_token');
    localStorage.removeItem('pustak_user');
    sessionStorage.removeItem('ems_welcome_played');
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        updateUserProfile,
        isAdmin: user?.role === 'Admin' || user?.role === 'Super Admin',
        isSuperAdmin: user?.role === 'Super Admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
