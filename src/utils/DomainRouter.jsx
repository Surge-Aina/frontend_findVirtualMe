import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import WidgetOverlay from '../components/WidgetOverlay/WidgetOverlay.jsx';
import { PortfolioProvider } from '../context/PortfolioContext.jsx';
import PortfolioRenderer from '../components/PortfolioRenderer.jsx';
import PortfolioEditor from '../components/PortfolioEditor.jsx';
import { portfolioApi } from '../api/portfolioApi.js';

function WidgetOverlayWrapper() {
  return (
    <>
      <WidgetOverlay />
      <Outlet />
    </>
  );
}

function DomainRouter({ children }) {
  const [domainRoute, setDomainRoute] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkDomain = async () => {
      const hostname = window.location.hostname;

      if (
        hostname === 'findvirtual.me' ||
        hostname === 'staging.findvirtual.me' ||
        hostname === 'localhost' ||
        hostname === '127.0.0.1'
      ) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_API}/domainRouter/domainLookup?domain=${hostname}`
        );
        if (response.data.portfolioId) {
          setDomainRoute(response.data);

          const portfolioRes = await portfolioApi.getById(response.data.portfolioId);
          setPortfolioData(portfolioRes.data);
        }
      } catch (err) {
        if (err?.status === 404) {
          console.log("Domain not found");
          return;
        }
        console.error('Domain lookup failed:', err);
      } finally {
        setLoading(false);
      }
    };
    checkDomain();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (domainRoute && portfolioData) {
    return (
      <PortfolioProvider
        initialPortfolioId={domainRoute.portfolioId}
        initialPortfolioType={portfolioData.template}
        isCustomDomain={true}
      >
        <Routes>
          <Route path="/" element={<WidgetOverlayWrapper />}>
            <Route index element={<PortfolioRenderer portfolioData={portfolioData} />} />
            <Route path="edit" element={<PortfolioEditor portfolioData={portfolioData} />} />
          </Route>
        </Routes>
      </PortfolioProvider>
    );
  }

  return children;
}

export default DomainRouter;