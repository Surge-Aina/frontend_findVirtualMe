import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [contextLoggedIn, setContextLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const contextLogin = () => {
    setContextLoggedIn(true);
  };

  const contextLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("portfolioId");
    setContextLoggedIn(false);
    toast.success("Logged Out!");
  };

  return (
    <AuthContext.Provider
      value={{ contextLoggedIn, contextLogin, contextLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
