import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { logApiError } from "@/shared/api/safeLog";

/** Default for consumers/tests when no Provider wraps the tree */
export const defaultAuthContextValue = {
  user: null,
  setUser: () => {},
  setUserAfterLogin: () => {},
  token: null,
  login: async () => {},
  logout: () => {},
  loading: false,
  refreshUser: async () => {},
  pendingFile: null,
  setPendingFile: () => {},
  contextLoggedIn: false,
  contextLogin: () => {},
  contextLogout: () => {},
};

export const AuthContext = createContext(defaultAuthContextValue);

export function AuthProvider({ children }) {
  //do not use this anymore will be phased out-----------------
  const [contextLoggedIn, setContextLoggedIn] = useState(!!localStorage.getItem("token"));
  const contextLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("portfolioId");
    setContextLoggedIn(false);
    toast.success("Logged Out!");
  };
  const contextLogin = () => {
    setContextLoggedIn(true);
  };

  //new login functionality--------------use this moving forward
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const backendUrl = import.meta.env.VITE_BACKEND_API;
  const queryClient = useQueryClient();
  const [pendingFile, setPendingFile] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    axios
      .get(`${backendUrl}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data.user);
        if (res.data.portfolioIds) {
          localStorage.setItem("userPortfolios", JSON.stringify(res.data.portfolioIds));
        }
      })
      .catch((err) => {
        logApiError(err, "Load current user failed");
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
      })
      .finally(() => {
        setLoading(false);
      });
    
  }, [token]);

  function setUserAfterLogin(responseData) {
    setUser((prev) => ({ ...prev, ...responseData.user }));
    setToken(responseData.token);
    localStorage.setItem("email", responseData.user.email);
    localStorage.setItem("userId", responseData.user._id || responseData.user.id);
    localStorage.setItem("token", responseData.token);

    // STORE PORTFOLIO IDs - ADD THESE LINES
    if (responseData.portfolioIds) {
      localStorage.setItem("userPortfolios", JSON.stringify(responseData.portfolioIds));
    }
  }

  const login = async (email, password) => {
    try {
      const identifier = typeof email === "string" ? email.trim() : email;
      const res = await axios.post(`${backendUrl}/api/auth/login`, {
        email: identifier,
        username: identifier,
        password,
      });

      setUserAfterLogin(res.data);
      toast.success("Logged In!");
    } catch (err) {
      logApiError(err, "Login failed");
      toast.error("Login failed");
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
    // clear all React Query caches
    queryClient.clear();
    toast.success("Logged Out!");
    setContextLoggedIn(false);
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${backendUrl}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
      toast.success("user refreshed");
    } catch (err) {
      logApiError(err, "Refresh user failed");
      toast.error("error refreshing user");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        setUserAfterLogin,
        token,
        login,
        logout,
        loading,
        refreshUser,
        pendingFile, //  new
        setPendingFile, // new
        //use above values moving forward
        contextLoggedIn,
        contextLogin,
        contextLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
