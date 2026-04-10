import React, { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminFlag = localStorage.getItem('isAdmin') === 'true';
    if (token) {
      setLoggedIn(true);
      setIsAdmin(adminFlag);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn, isAdmin, setIsAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
