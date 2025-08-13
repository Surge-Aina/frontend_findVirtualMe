import { toast } from "react-toastify";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
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
      navigate(`/potfolio/${portfolioId}`);
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

      const portfolioId = res.data.portfolioIds[0];
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("email", form.email);
      localStorage.setItem("portfolioId", portfolioId);
      setLoggedIn(true);
      toast.success("Login successful!");
      navigate(`/portfolio/${portfolioId}`);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-blue-400 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-indigo-500 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-purple-500 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl px-10 py-12 z-10">
        <div className="flex items-center justify-center mb-6"></div>
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          Welcome
        </h1>
        <p className="text-center text-slate-300 mb-8">
          {loggedIn ? "Hello Admin" : "Sign in to manage your portfolio"}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="relative">
            <label
              className={`absolute left-4 text-sm transition-all duration-300 ${
                focusedField === "email" || form.email
                  ? "transform -translate-y-5 text-blue-400 text-xs"
                  : "top-3 text-slate-400"
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
              className="w-full px-4 pt-5 pb-2 bg-slate-800/50 border-b-2 border-slate-600 text-white rounded-lg focus:outline-none focus:border-blue-400 transition-colors"
              autoComplete="email"
            />
          </div>

          <div className="relative">
            <label
              className={`absolute left-4 text-sm transition-all duration-300 ${
                focusedField === "password" || form.password
                  ? "transform -translate-y-5 text-blue-400 text-xs"
                  : "top-3 text-slate-400"
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
              className="w-full px-4 pt-5 pb-2 bg-slate-800/50 border-b-2 border-slate-600 text-white rounded-lg focus:outline-none focus:border-blue-400 transition-colors"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center py-1">{error}</div>
          )}

          <button
            type="submit"
            className="relative w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 shadow-lg shadow-blue-900/30 overflow-hidden group"
            disabled={loading}
          >
            <span className="relative z-10">
              {loading ? "Processing..." : "Sign In"}
            </span>
            <span className="absolute inset-0 w-1/3 h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
          </button>

          {loggedIn && (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-6 py-3 bg-transparent border border-slate-600 text-slate-300 rounded-xl font-semibold hover:bg-slate-800/50 hover:border-slate-500 transition-all duration-300"
            >
              Sign Out
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
