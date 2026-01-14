import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
export const AuthContext = createContext();

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
  useEffect(() => {
    if (!token) return;
    if (token) {
      axios
        .get(`${backendUrl}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data.user);
          console.log("res.data in auth context: ", res.data);

          // ✅ ADD THIS CODE:
          if (res.data.portfolioIds) {
            localStorage.setItem("userPortfolios", JSON.stringify(res.data.portfolioIds));
            console.log("📁 Stored portfolio IDs (from getMe useEffect()):", res.data.portfolioIds);
          }
        })
        .catch(() => {
          setToken(null);
          setUser(null);
          localStorage.removeItem("token");
        });
    }
  }, [token]);

  useEffect(() => {
    if (pendingFile) console.log("✅ pendingFile stored:", pendingFile.name);
  }, [pendingFile]);

  // useEffect(() => {
  //   console.log("User++++++++++++++++++++", user);
  // }, [user]);

  function setUserAfterLogin(responseData) {
    console.log("response data: ", responseData);
    setUser((prev) => ({ ...prev, ...responseData.user }));
    setToken(responseData.token);
    localStorage.setItem("email", responseData.user.email);
    localStorage.setItem("userId", responseData.user._id || responseData.user.id);
    localStorage.setItem("token", responseData.token);

    // STORE PORTFOLIO IDs - ADD THESE LINES
    if (responseData.portfolioIds) {
      localStorage.setItem("userPortfolios", JSON.stringify(responseData.portfolioIds));
      console.log("📁 Stored portfolio IDs (from login()):", responseData.portfolioIds);
    } else {
      console.log("⚠️ No portfolioIds received from backend");
    }
  }

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${backendUrl}/user/login`, {
        email,
        password,
      });

      setUserAfterLogin(res.data);

      // setUser((prev) => ({ ...prev, ...res.data.user }));
      // setToken(res.data.token);
      // localStorage.setItem("email", res.data.user.email);
      // localStorage.setItem("userId", res.data.user._id || res.data.user.id);
      // localStorage.setItem("token", res.data.token);

      // // STORE PORTFOLIO IDs - ADD THESE LINES
      // if (res.data.portfolioIds) {
      //   localStorage.setItem("userPortfolios", JSON.stringify(res.data.portfolioIds));
      //   console.log("📁 Stored portfolio IDs (from login()):", res.data.portfolioIds);
      // } else {
      //   console.log("⚠️ No portfolioIds received from backend");
      // }

      console.log("logged In");
      toast.success("Logged In!");
    } catch (err) {
      toast.error("Login failed");
      console.log("Login failed", err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
    // clear all React Query caches
    queryClient.clear();
    console.log("Logged Out");
    toast.success("Logged Out!");
    setContextLoggedIn(false);
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${backendUrl}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
      toast.success("user refreshed");
    } catch (err) {
      console.error("Error refreshing user:", err);
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
