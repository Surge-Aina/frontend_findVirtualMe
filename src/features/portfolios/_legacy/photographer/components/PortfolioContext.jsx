import React, { createContext, useContext, useState } from 'react';
import { AuthContext } from '@/shared/context/AuthContext';
import { resolvePhotographerPortfolioId } from '../photographerPortfolioId';

const PortfolioContext = createContext();

export const usePortfolio = () => useContext(PortfolioContext);

export const PortfolioProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [portfolioId, setPortfolioId] = useState(() =>
    resolvePhotographerPortfolioId(localStorage.getItem('portfolioId'), null)
  );

  React.useEffect(() => {
    const resolved = resolvePhotographerPortfolioId(portfolioId, user);
    if (resolved !== portfolioId) setPortfolioId(resolved);
  }, [user, portfolioId]);

  React.useEffect(() => {
    // Store the original fetch function
    const originalFetch = window.fetch;
    
    window.fetch = async (url, options = {}) => {
      const urlObj = new URL(url, window.location.origin);
      
      if (options.method === 'GET' || options.method === 'DELETE' || !options.method) {
        urlObj.searchParams.set('portfolioId', portfolioId);
      }

      if (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') {
        if (options.body) {
          try {
            const bodyData = JSON.parse(options.body);
            bodyData.portfolioId = portfolioId;
            options.body = JSON.stringify(bodyData);
          } catch (e) {
            // If body is not JSON, create FormData or append to existing
            if (options.body instanceof FormData) {
              options.body.append('portfolioId', portfolioId);
            } else {
              // String bodies -- append as query param instead
              urlObj.searchParams.set('portfolioId', portfolioId);
            }
          }
        } else {
          // No body -- add portfolioId to query params
          urlObj.searchParams.set('portfolioId', portfolioId);
        }
      }

      // Make fetch call with the modified URL and options
      return originalFetch(urlObj.toString(), options);
    };

    // Cleanup
    return () => {
      window.fetch = originalFetch;
    };
  }, [portfolioId]);

  // Persist portfolioId in localStorage -- move to backend later...?
  React.useEffect(() => {
    localStorage.setItem('portfolioId', portfolioId);
  }, [portfolioId]);

  return (
    <PortfolioContext.Provider value={{ portfolioId, setPortfolioId }}>
      {children}
    </PortfolioContext.Provider>
  );
};
