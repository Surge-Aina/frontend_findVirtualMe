import React, { createContext, useState, useEffect, useContext } from 'react';
import { portfolioAPI } from '../utils/api';

const PortfolioContext = createContext();

export const PortfolioProvider = ({ children }) => {
  const [portfolio, setPortfolio] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch portfolio data
  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const data = await portfolioAPI.getPortfolio();
      setPortfolio(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError('Failed to load portfolio data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Force refresh portfolio data
  const forceRefresh = async () => {
    await fetchPortfolio();
  };

  // Add a new portfolio item
  const addPortfolioItem = async (itemData) => {
    try {
      const newItem = await portfolioAPI.addPortfolioItem(itemData);
      setPortfolio(prevPortfolio => ({
        ...prevPortfolio,
        [itemData.section]: [
          ...(prevPortfolio[itemData.section] || []),
          newItem
        ].sort((a, b) => a.order - b.order)
      }));
      return { success: true };
    } catch (error) {
      console.error('Error adding portfolio item:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add item. Please try again.' 
      };
    }
  };

  // Update a portfolio item
  const updatePortfolioItem = async (id, updates) => {
    try {
      const updatedItem = await portfolioAPI.updatePortfolioItem(id, updates);
      setPortfolio(prevPortfolio => {
        const section = Object.entries(prevPortfolio).find(([, items]) => 
          items.some(item => item.id === id)
        )?.[0];
        
        if (!section) return prevPortfolio;
        
        return {
          ...prevPortfolio,
          [section]: prevPortfolio[section]
            .map(item => item.id === id ? { ...item, ...updatedItem } : item)
            .sort((a, b) => a.order - b.order)
        };
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating portfolio item:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update item. Please try again.' 
      };
    }
  };

  // Load portfolio data on component mount
  useEffect(() => {
    fetchPortfolio();
  }, []);

  return (
    <PortfolioContext.Provider
      value={{
        portfolio,
        loading,
        error,
        addPortfolioItem,
        updatePortfolioItem,
        refetch: fetchPortfolio,
        forceRefresh
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

export default PortfolioContext;
