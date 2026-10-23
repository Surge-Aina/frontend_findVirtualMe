import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@/shared/context/AuthContext.jsx";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.identifier.trim() || !form.password) {
      setError("Enter your email or username and password.");
      return;
    }

    setSubmitting(true);
    try {
      await login(form.identifier.trim(), form.password);
      navigate("/dashboard");
    } catch {
      setError("Sign-in failed. Check your email or username and password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-transparent dark:border-neutral-700">
      <h2 className="text-2xl font-semibold mb-4 text-center text-slate-800 dark:text-neutral-100">
        Sign In
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="login-identifier"
            className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1"
          >
            Email or username
          </label>
          <input
            id="login-identifier"
            type="text"
            name="identifier"
            autoComplete="username"
            placeholder="Email or username"
            value={form.identifier}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-200 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label
            htmlFor="login-password"
            className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1"
          >
            Password
          </label>
          <input
            id="login-password"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-200 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-neutral-400">
        Need an account?{" "}
        <Link to="/signup" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
