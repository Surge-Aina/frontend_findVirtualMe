import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function DomainRouter({ children }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkDomain = async () => {
      const hostname = window.location.hostname;
      
      // Don't redirect for your main domain
      if (hostname === 'findvirtual.me') {
        setLoading(false);
        return;
      }

      try {
        // Call backend to get portfolio info for this domain
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_API}/domainRouter/domainLookup?domain=${hostname}`
        );

        if (response.data.portfolioId) {
          const targetPath = `/portfolios/${response.data.portfolioType}/${response.data.portfolioId}`;
          
          // Only navigate if we're not already there
          if (window.location.pathname !== targetPath) {
            navigate(targetPath, { replace: true });
          }
        }
      } catch (err) {
        console.error('Domain lookup failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkDomain();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return children;
}

export default DomainRouter;