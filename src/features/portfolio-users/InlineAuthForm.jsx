import { useState } from "react";
import { usePortfolioUser } from "@/shared/context/PortfolioUserContext";

/**
 * Shown on `/my-account` when the visitor is not yet signed in for this
 * portfolio. Mirrors the `AccountBlock` tabs but is scoped to this page so
 * the dashboard flow stays self-contained.
 */
export default function InlineAuthForm() {
  const { login, signup, loading, error } = usePortfolioUser();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [localError, setLocalError] = useState(null);

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await signup({
          name: form.name,
          email: form.email,
          password: form.password,
        });
      }
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-neutral-800 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-neutral-100">My Account</h1>
          <p className="text-gray-500 dark:text-neutral-400 text-sm">
            Sign in to view your history and request services.
          </p>
        </div>

        <div className="flex border-b border-gray-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-3 text-sm font-medium ${
              mode === "login"
                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
                : "text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-800"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 py-3 text-sm font-medium ${
              mode === "signup"
                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
                : "text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-800"
            }`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                className={inputClass}
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              className={inputClass}
              required
              minLength={6}
            />
          </div>

          {(localError || error) && (
            <p className="text-sm text-red-600 dark:text-red-400">{localError || error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
