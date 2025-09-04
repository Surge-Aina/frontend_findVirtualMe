import { createContext, useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [contextLoggedIn, setContextLoggedIn] = useState(
    !!localStorage.getItem("token")
  );
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Initialize user data from localStorage
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    
    if (token && email) {
      setUser({
        email: email,
        ownerId: email,
        role: 'admin', // Default to admin for now
        username: email
      });
    }
  }, [contextLoggedIn]);

  const contextLogin = (token = null) => {
    setContextLoggedIn(true);
    if (token) {
      localStorage.setItem("token", token);
    }
  };

  const contextLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("portfolioId");
    setContextLoggedIn(false);
    setUser(null);
    toast.success("Logged Out!");
  };

  return (
    <AuthContext.Provider
      value={{ 
        contextLoggedIn, 
        contextLogin, 
        contextLogout,
        user,
        login: contextLogin,
        logout: contextLogout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
