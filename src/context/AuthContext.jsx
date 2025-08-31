import React, { createContext, useContext, useEffect, useState } from 'react';
import { sanityHelpers } from '../sanity.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored authentication token or session
    const storedAuth = localStorage.getItem('adminAuth');
    if (storedAuth) {
      const authData = JSON.parse(storedAuth);
      setCurrentUser(authData.user);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email, password) => {
    try {
      // Authenticate against Sanity users
      const authResult = await sanityHelpers.authenticateUser(email, password);
      
      if (authResult.success) {
        const user = authResult.user;
        
        setCurrentUser(user);
        setIsAuthenticated(true);
        
        // Store authentication state
        localStorage.setItem('adminAuth', JSON.stringify({ user, timestamp: Date.now() }));
        
        return { success: true };
      } else {
        throw new Error(authResult.error || 'Kredensial tidak valid');
      }
    } catch (error) {
      console.error('Error login:', error);
      throw new Error(error.message || 'Autentikasi gagal');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
  };

  const value = {
    currentUser,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
