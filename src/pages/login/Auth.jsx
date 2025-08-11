import { toast } from "react-toastify";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Auth = ({ onClose }) => {
  const apiUrl = import.meta.env.VITE_BAKEND_API;
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const portfolioId = localStorage.getItem("portfolioId");
    if (token) {
      navigate(`/portfolio/${portfolioId}`);
      if (onClose) onClose();
    }
    setLoggedIn(!!token);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${apiUrl}/user/login`, {
        email: form.email,
        password: form.password,
      });

      const portfolioId = res.data.portfolioIds && res.data.portfolioIds[0];
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("email", form.email);
      if (portfolioId) {
        localStorage.setItem("portfolioId", portfolioId);
        setLoggedIn(true);
        toast.success("Login successful!");
        navigate(`/portfolio/${portfolioId}`);
        if (onClose) onClose();
      } else {
        setLoggedIn(true);
        toast.success("Login successful, but no portfolio found!");
        if (onClose) onClose();
      }
    } catch (err) {
      setError("Invalid credentials");
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setForm({ email: "", password: "" });
    toast.success("Logged out!");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 min-h-screen"
      style={{ backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      <div
        className="relative max-w-md mx-4 sm:mx-auto bg-gradient-to-br from-slate-100 to-slate-300 border border-slate-300 rounded-2xl shadow-2xl px-14 py-8 sm:px-10 sm:py-12 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-700 text-xl font-bold"
          aria-label="Close"
        >
          ×
        </button>
        <div className="flex items-center justify-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg font-bold">FV</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2 text-center">
          Welcome
        </h1>
        <p className="text-center text-slate-600 mb-8">
          {loggedIn ? "Hello" : "Sign in to manage your portfolio"}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="relative">
            <label
              className={`absolute left-4 text-sm transition-all duration-300 ${
                focusedField === "email" || form.email
                  ? "transform -translate-y-5 text-blue-600 text-xs"
                  : "top-3 text-slate-500"
              }`}
            >
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              required
              className="w-full px-4 pt-5 pb-2 bg-slate-200 border-b-2 border-slate-400 text-slate-800 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
              autoComplete="email"
            />
          </div>

          <div className="relative">
            <label
              className={`absolute left-4 text-sm transition-all duration-300 ${
                focusedField === "password" || form.password
                  ? "transform -translate-y-5 text-blue-600 text-xs"
                  : "top-3 text-slate-500"
              }`}
            >
              Password
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              required
              className="w-full px-4 pt-5 pb-2 bg-slate-200 border-b-2 border-slate-400 text-slate-800 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center py-1">{error}</div>
          )}

          <button
            type="submit"
            className="relative w-full px-6 py-4 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl font-semibold hover:from-slate-600 hover:to-slate-800 transition-all duration-300 shadow-lg shadow-blue-900/30 overflow-hidden group"
            disabled={loading}
          >
            <span className="relative z-10">
              {loading ? "Processing..." : "Sign In"}
            </span>
            <span className="absolute inset-0 w-1/3 h-full bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
          </button>

          {loggedIn && (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-6 py-3 bg-transparent border border-slate-600 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 hover:border-slate-700 transition-all duration-300"
            >
              Sign Out
            </button>
          )}

          <button
            type="button"
            className="relative w-full px-6 py-3 mt-2 bg-slate-200 border border-slate-600 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 hover:border-slate-700 transition-all duration-300 overflow-hidden group"
            onClick={() => {
              /* open sign up modal or switch to sign up form */
            }}
          >
            <span className="relative z-10">Sign Up</span>
            <span className="absolute inset-0 w-1/3 h-full bg-white/30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;