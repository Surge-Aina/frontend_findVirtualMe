import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const apiUrl = import.meta.env.VITE_BACKEND_API;
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [success, setSuccess] = useState(false);
  const { contextLogin } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const res = await axios.post(`${apiUrl}/user/signup`, form);
      const { token, email } = res.data;

      // Save token & email to local storage
      localStorage.setItem("token", token);
      localStorage.setItem("email", email);
      contextLogin(); // update logged in context

      setSuccess(true);
      toast.success("Sign up successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Sign up failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-center">Sign Up</h2>
      <form className="space-y-4" onSubmit={handleSignUp}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="w-full bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
        >
          Sign Up
        </button>
      </form>
      {success && (
        <div className="mt-6 text-center text-blue-600 font-semibold">
          <svg className="w-6 h-6 mx-auto mb-2 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Sign up successful! You can close this window.
        </div>
      )}
    </div>
  );
}
