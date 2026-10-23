import { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {
  const apiUrl = import.meta.env.VITE_BACKEND_API;
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = axios.post(`${apiUrl}/api/auth/forgot-password`, { email });
      console.log("API SUCCESS:", res);

      setMessage(res.data?.message || "Reset link sent successfully");
    } catch (err) {
      console.error("Forgot password error:", err);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full p-6 border rounded-xl shadow bg-white">
        <h2 className="text-2xl font-semibold mb-4 text-center">Forgot Password</h2>

        <p className="text-sm text-gray-600 text-center mb-4">Enter your email and we’ll send you a reset link.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full border px-3 py-2 rounded mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-center text-gray-600">{message}</p>}
      </div>
    </div>
  );
}
