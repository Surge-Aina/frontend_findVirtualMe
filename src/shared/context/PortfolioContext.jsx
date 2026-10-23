// context/PortfolioContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const defaultPortfolioOwner = {
  id: null,
  name: "",
  email: "",
};

/** Public profile fields only. Email is never taken from a user record. */
function ownerDisplayName(user) {
  if (!user || typeof user !== "object") return "";
  const candidates = [user.displayName, user.username, user.name];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  const first = typeof user.firstName === "string" ? user.firstName.trim() : "";
  const last = typeof user.lastName === "string" ? user.lastName.trim() : "";
  return [first, last].filter(Boolean).join(" ");
}

/** Default for consumers/tests when no Provider wraps the tree */
export const defaultPortfolioContextValue = {
  portfolioId: null,
  setPortfolioId: () => {},
  portfolioType: null,
  setPortfolioType: () => {},
  portfolioOwner: { ...defaultPortfolioOwner },
  setPortfolioOwner: () => {},
  isOwnerReady: false,
  isCustomDomain: false,
  clearPortfolio: () => {},
};

export const PortfolioContext = createContext(defaultPortfolioContextValue);

export function PortfolioProvider({ children, initialPortfolioId, initialPortfolioType, isCustomDomain = false }) {
  const [portfolioId, setPortfolioId] = useState(initialPortfolioId ?? null);
  const [portfolioType, setPortfolioType] = useState(initialPortfolioType ?? null);
  const [portfolioOwner, setPortfolioOwner] = useState(defaultPortfolioOwner);
  const [isOwnerReady, setIsOwnerReady] = useState(false);

  useEffect(() => {
    // Legacy pages set name and email on the portfolio itself, with no user id.
    if (!portfolioOwner.id) {
      setIsOwnerReady(!!(portfolioOwner.name && portfolioOwner.email));
      return;
    }

    // An owner id is enough. Do not wait for an email the public profile does not return.
    if (portfolioOwner.name) {
      setIsOwnerReady(true);
    }
  }, [portfolioOwner.id, portfolioOwner.name, portfolioOwner.email]);

  useEffect(() => {
    if (!portfolioOwner.id || portfolioOwner.name) return undefined;

    let cancelled = false;
    setIsOwnerReady(false);
    const ownerId = portfolioOwner.id;

    const fetchOwner = async () => {
      const base = import.meta.env.VITE_BACKEND_API;
      try {
        let user;
        try {
          const res = await axios.get(`${base}/api/users/public/${ownerId}`);
          user = res.data?.user;
        } catch (err) {
          // Current production has no public projection and answers 404.
          // Fall back to the open user read. A locked-down backend 401s that
          // route, so only the 404 is treated as "try the old URL".
          if (err?.response?.status !== 404) throw err;
          const fallback = await axios.get(`${base}/api/users/${ownerId}`);
          user = fallback.data?.user;
        }

        if (cancelled) return;
        const name = ownerDisplayName(user);
        setPortfolioOwner((prev) => {
          if (String(prev.id) !== String(ownerId)) return prev;
          return {
            ...prev,
            name: prev.name || name,
          };
        });
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch portfolio owner details:', err);
        }
      } finally {
        if (!cancelled) setIsOwnerReady(true);
      }
    };

    fetchOwner();
    return () => {
      cancelled = true;
    };
  }, [portfolioOwner.id, portfolioOwner.name]);

  const clearPortfolio = () => {
    setPortfolioId(null);
    setPortfolioType(null);
    setPortfolioOwner(defaultPortfolioOwner);
    setIsOwnerReady(false);
  };

  return (
    <PortfolioContext.Provider value={{
      portfolioId, setPortfolioId,
      portfolioType, setPortfolioType,
      portfolioOwner, setPortfolioOwner,
      isOwnerReady,
      isCustomDomain,
      clearPortfolio,
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  return useContext(PortfolioContext);
}