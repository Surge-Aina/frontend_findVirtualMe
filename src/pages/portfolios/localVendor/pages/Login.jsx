import { toast } from "react-toastify";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiLogIn, FiUserCheck, FiLogOut } from "react-icons/fi";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoggedIn(!!token);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/user/login", {
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("email", form.email);
      setLoggedIn(true);
      toast.success("Login successful!");
      navigate("/portfolios/localVendor");
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
    navigate("/portfolios/localVendor");
    toast.success("Logged out!");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white shadow-lg p-8 rounded-lg w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">
            {loggedIn ? (
              <span className="flex justify-center items-center gap-2 text-green-600">
                <FiUserCheck /> Hello Admin
              </span>
            ) : (
              <span className="flex justify-center items-center gap-2 text-blue-600">
                <FiLogIn /> Welcome Back
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm">
            Please enter your credentials to continue
          </p>
        </div>

        {!loggedIn ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-sm text-gray-600 mb-1"
                htmlFor="email"
              >
                Email
              </label>
              <input
                name="email"
                type="email"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label
                className="block text-sm text-gray-600 mb-1"
                htmlFor="password"
              >
                Password
              </label>
              <input
                name="password"
                type="password"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-200"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-gray-700 mb-4">You're already logged in.</p>
            <button
              onClick={handleLogout}
              className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              <FiLogOut className="mr-2" /> Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
