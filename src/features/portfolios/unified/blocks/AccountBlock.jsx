import { useState } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { usePortfolioView } from "../context/PortfolioViewContext";
import {
  PortfolioUserProvider,
  usePortfolioUser,
} from "@/shared/context/PortfolioUserContext";
import { usePortfolio } from "@/shared/context/PortfolioContext";

/**
 * Public-facing sub-user auth widget. Placed on a portfolio's public page,
 * it switches between login and signup tabs for logged-out visitors, and
 * collapses to a "Welcome {name} -> Go to My Account" CTA when a sub-user
 * session is already active for this portfolio.
 */

function AccountBlockInner({ title, subtitle, ctaLoggedOut, ctaLoggedIn }) {
  const { portfolioUser, login, signup, logout, loading, error } = usePortfolioUser();
  const { isCustomDomain } = usePortfolio();
  const view = usePortfolioView();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [localError, setLocalError] = useState(null);

  const dashboardPath = isCustomDomain
    ? "/my-account"
    : `/p/${view?.portfolioId}/my-account`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
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

  if (portfolioUser) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <FaUserCircle className="text-4xl text-blue-600" />
            <div className="flex-1">
              <p className="text-gray-900 font-semibold">
                Welcome, {portfolioUser.name || portfolioUser.email}
              </p>
              <p className="text-gray-500 text-sm">
                You're signed in to {title || "your account"}.
              </p>
            </div>
            <Link
              to={dashboardPath}
              className="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              {ctaLoggedIn || "Open my account"}
            </Link>
            <button
              type="button"
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700 underline ml-2"
            >
              Sign out
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-xl mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {title || "Customer Account"}
          </h2>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-3 text-sm font-medium transition ${
                mode === "login"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-3 text-sm font-medium transition ${
                mode === "signup"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
              />
            </div>

            {(localError || error) && (
              <p className="text-sm text-red-600">{localError || error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60 transition"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? ctaLoggedOut || "Sign in"
                  : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default function AccountBlock({
  template,
  title,
  subtitle,
  ctaLoggedOut,
  ctaLoggedIn,
}) {
  const view = usePortfolioView();
  const portfolioId = view?.portfolioId;

  if (!portfolioId) {
    // Editor preview / no portfolio context — render a stub.
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-xl mx-auto px-4 text-center text-gray-500">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            {title || "Customer Account"}
          </h2>
          <p>Account sign-in will appear here on the live portfolio.</p>
        </div>
      </section>
    );
  }

  return (
    <PortfolioUserProvider
      portfolioId={portfolioId}
      template={template || view?.template}
    >
      <AccountBlockInner
        title={title}
        subtitle={subtitle}
        ctaLoggedOut={ctaLoggedOut}
        ctaLoggedIn={ctaLoggedIn}
      />
    </PortfolioUserProvider>
  );
}
