// context/PortfolioContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const defaultPortfolioOwner = {
  id: null,
  name: "",
  email: "",
};

export const PortfolioContext = createContext();

export function PortfolioProvider({ children, initialPortfolioId, initialPortfolioType, isCustomDomain = false }) {
  const [portfolioId, setPortfolioId] = useState(initialPortfolioId ?? null);
  const [portfolioType, setPortfolioType] = useState(initialPortfolioType ?? null);
  const [portfolioOwner, setPortfolioOwner] = useState(defaultPortfolioOwner);
  const [isOwnerReady, setIsOwnerReady] = useState(false);

  useEffect(() => {
    // No id, but we have name + email set directly — still ready
    if (!portfolioOwner.id) {
      setIsOwnerReady(!!(portfolioOwner.name && portfolioOwner.email));
      console.log("No owner ID, but owner details present. Setting isOwnerReady to", !!(portfolioOwner.name && portfolioOwner.email));
      return;
    }

    // Have id and already have everything
    if (portfolioOwner.name && portfolioOwner.email) {
      setIsOwnerReady(true);
      console.log("owner ID and owner details present. Setting isOwnerReady to true");
      return;
    }

    // Have id but missing details — fetch them
    setIsOwnerReady(false);

    const fetchOwner = async () => {
      try {
        console.log("Fetching portfolio owner details for ID:", portfolioOwner.id);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_API}/user/getUser/${portfolioOwner.id}`);
        setPortfolioOwner(prev => ({
          ...prev,
          name: prev.name || res.data.user.username || res.data.user.name || "",
          email: prev.email || res.data.user.email || "",
        }));
        console.log("Fetched portfolio owner details:", res.data);
      } catch (err) {
        console.error('Failed to fetch portfolio owner details:', err);
      } finally {
        setIsOwnerReady(true);
      }
    };

    fetchOwner();
  }, [portfolioOwner.id, portfolioOwner.name, portfolioOwner.email]);

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