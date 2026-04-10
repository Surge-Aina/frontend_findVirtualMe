import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Inbox from "./pages/Inbox";
import BulkReply from "./pages/BulkReply";
import BulkUpload from "./pages/BulkUpload"; // ⬅️ NEW
import OAuthGoogleDone from "./pages/OAuthGoogleDone";

function App() {
  const [auth, setAuth] = useState({
    user: null,
    token: null,
    loading: true,
  });

  // Load auth from localStorage on first render
  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAuth({
          user: parsed.user || null,
          token: parsed.token || null,
          loading: false,
        });
      } catch {
        setAuth({ user: null, token: null, loading: false });
      }
    } else {
      setAuth({ user: null, token: null, loading: false });
    }
  }, []);

  const handleAuth = ({ user, token }) => {
    const authData = { user, token };
    setAuth({ ...authData, loading: false });
    localStorage.setItem("auth", JSON.stringify(authData));
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setAuth({ user: null, token: null, loading: false });
  };

  if (auth.loading) {
    return <div style={{ padding: "2rem" }}>Loading app...</div>;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/signup"
        element={
          auth.token ? (
            <Navigate to="/mvp" replace />
          ) : (
            <Signup onAuth={handleAuth} />
          )
        }
      />
      <Route
        path="/login"
        element={
          auth.token ? (
            <Navigate to="/mvp" replace />
          ) : (
            <Login onAuth={handleAuth} />
          )
        }
      />

      {/* Protected routes */}
      <Route
        path="/inbox"
        element={
          <ProtectedRoute auth={auth}>
            <Inbox auth={auth} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bulk-reply"
        element={
          <ProtectedRoute auth={auth}>
            <BulkReply auth={auth} />
          </ProtectedRoute>
        }
      />

      {/* NEW: bulk upload (Excel-style) */}
      <Route
        path="/bulk-upload"
        element={
          <ProtectedRoute auth={auth}>
            <BulkUpload auth={auth} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute auth={auth}>
            <Dashboard auth={auth} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
  path="/oauth/google-done"
  element={
    <ProtectedRoute auth={auth}>
      <OAuthGoogleDone />
    </ProtectedRoute>
  }
/>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/mvp" replace />} />
    </Routes>
  );
}

export default App;
