import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { portfolioUserApi } from "@/shared/api/portfolioUserApi";

/**
 * Context for portfolio sub-user (a.k.a. guestUser) sessions.
 *
 * Each portfolio has its own session; tokens are stored in localStorage under
 * the namespaced key `portfolioUserToken:<portfolioId>`. This means a single
 * browser can simultaneously hold sessions for multiple portfolios without
 * collisions, and signing in to one portfolio never logs you out of another.
 *
 * This is intentionally separate from the main `AuthContext`, which manages
 * platform users (portfolio owners). Both can coexist on the same page.
 */

const TEMPLATE_TO_PORTFOLIO_TYPE = {
  healthcare: "healthcare",
  handyman: "handyman",
  photographer: "photographer",
  projectManager: "project_manager",
  dataScientist: "data_scientist",
  cleaningServices: "cleaning_services",
  localVendor: "local_vendor",
};

export function templateToPortfolioType(template) {
  if (!template) return null;
  return TEMPLATE_TO_PORTFOLIO_TYPE[template] || template;
}

function tokenKey(portfolioId) {
  return portfolioId ? `portfolioUserToken:${portfolioId}` : null;
}

function userKey(portfolioId) {
  return portfolioId ? `portfolioUser:${portfolioId}` : null;
}

const defaultValue = {
  portfolioId: null,
  portfolioType: null,
  portfolioUser: null,
  token: null,
  loading: false,
  error: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  refresh: () => {},
};

export const PortfolioUserContext = createContext(defaultValue);

export function PortfolioUserProvider({ portfolioId, portfolioType, template, children }) {
  const resolvedPortfolioType =
    portfolioType || templateToPortfolioType(template);

  const [token, setToken] = useState(() => {
    const k = tokenKey(portfolioId);
    return k ? localStorage.getItem(k) : null;
  });
  const [portfolioUser, setPortfolioUser] = useState(() => {
    const k = userKey(portfolioId);
    if (!k) return null;
    try {
      const raw = localStorage.getItem(k);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // When the active portfolio changes, rehydrate from localStorage.
  useEffect(() => {
    const tk = tokenKey(portfolioId);
    const uk = userKey(portfolioId);
    setToken(tk ? localStorage.getItem(tk) : null);
    if (!uk) {
      setPortfolioUser(null);
      return;
    }
    try {
      const raw = localStorage.getItem(uk);
      setPortfolioUser(raw ? JSON.parse(raw) : null);
    } catch {
      setPortfolioUser(null);
    }
  }, [portfolioId]);

  const persistSession = useCallback(
    (nextToken, nextUser) => {
      const tk = tokenKey(portfolioId);
      const uk = userKey(portfolioId);
      if (!tk || !uk) return;
      if (nextToken) {
        localStorage.setItem(tk, nextToken);
      } else {
        localStorage.removeItem(tk);
      }
      if (nextUser) {
        localStorage.setItem(uk, JSON.stringify(nextUser));
      } else {
        localStorage.removeItem(uk);
      }
    },
    [portfolioId]
  );

  const login = useCallback(
    async ({ email, password }) => {
      if (!portfolioId || !resolvedPortfolioType) {
        throw new Error("Portfolio context is missing");
      }
      setLoading(true);
      setError(null);
      try {
        const res = await portfolioUserApi.login({
          email,
          password,
          portfolioType: resolvedPortfolioType,
          portfolioId,
        });
        const { token: nextToken, user } = res.data;
        setToken(nextToken);
        setPortfolioUser(user);
        persistSession(nextToken, user);
        return { user, token: nextToken };
      } catch (err) {
        const message =
          err?.response?.data?.message || err.message || "Login failed";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [portfolioId, resolvedPortfolioType, persistSession]
  );

  const signup = useCallback(
    async (payload) => {
      if (!portfolioId || !resolvedPortfolioType) {
        throw new Error("Portfolio context is missing");
      }
      setLoading(true);
      setError(null);
      try {
        await portfolioUserApi.signup({
          ...payload,
          portfolioType: resolvedPortfolioType,
          portfolioId,
        });
        // Auto-login after successful signup so users land in the dashboard.
        return await login({ email: payload.email, password: payload.password });
      } catch (err) {
        const message =
          err?.response?.data?.message || err.message || "Signup failed";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [portfolioId, resolvedPortfolioType, login]
  );

  const logout = useCallback(() => {
    setToken(null);
    setPortfolioUser(null);
    persistSession(null, null);
  }, [persistSession]);

  const refresh = useCallback(() => {
    const tk = tokenKey(portfolioId);
    const uk = userKey(portfolioId);
    setToken(tk ? localStorage.getItem(tk) : null);
    try {
      const raw = uk ? localStorage.getItem(uk) : null;
      setPortfolioUser(raw ? JSON.parse(raw) : null);
    } catch {
      setPortfolioUser(null);
    }
  }, [portfolioId]);

  const value = useMemo(
    () => ({
      portfolioId,
      portfolioType: resolvedPortfolioType,
      portfolioUser,
      token,
      loading,
      error,
      login,
      signup,
      logout,
      refresh,
    }),
    [portfolioId, resolvedPortfolioType, portfolioUser, token, loading, error, login, signup, logout, refresh]
  );

  return (
    <PortfolioUserContext.Provider value={value}>
      {children}
    </PortfolioUserContext.Provider>
  );
}

export function usePortfolioUser() {
  return useContext(PortfolioUserContext);
}
