import { useEffect, useState } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import axios from 'axios';
import WidgetOverlay from '@/features/portfolios/unified/WidgetOverlay/WidgetOverlay.jsx';
import { PortfolioProvider } from '../context/PortfolioContext.jsx';
import PortfolioRenderer from '@/features/portfolios/unified/PortfolioRenderer.jsx';
import PortfolioEditor from '@/features/portfolios/unified/PortfolioEditor.jsx';
import { portfolioApi } from '../api/portfolioApi.js';
import { getBrowserHostname } from './windowHost.js';

function WidgetOverlayWrapper() {
  return (
    <>
      <WidgetOverlay />
      <Outlet />
    </>
  );
}

function isAxiosStatus(err, code) {
  return err?.response?.status === code;
}

const ERROR_COPY = {
  not_found: 'This domain is not connected to a portfolio.',
  portfolio_unavailable: 'This portfolio is not available.',
  network: 'Could not load this site. Please try again later.',
};

function DomainErrorScreen({ kind }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center text-gray-700">
      <p className="text-lg max-w-md">{ERROR_COPY[kind] ?? ERROR_COPY.network}</p>
    </div>
  );
}

function DomainRouter({ children }) {
  const [domainRoute, setDomainRoute] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const checkDomain = async () => {
      const hostname = getBrowserHostname();

      if (
        hostname === 'findvirtual.me' ||
        hostname === 'staging.findvirtual.me' ||
        hostname === 'localhost' ||
        hostname === '127.0.0.1'
      ) {
        setLoading(false);
        return;
      }

      /** Backend API is on another host (e.g. localhost:5000), so Host header there is not the site hostname. */
      const portfolioDomainHeaders = { 'X-Portfolio-Domain-Host': hostname };

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_API}/api/domains/router/lookup?domain=${hostname}`
        );
        const portfolioId = response.data?.portfolioId;
        if (!portfolioId) {
          setLoadError('not_found');
          return;
        }

        const portfolioRes = await portfolioApi.getById(portfolioId, {
          headers: portfolioDomainHeaders,
        });
        setDomainRoute(response.data);
        setPortfolioData(portfolioRes.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (isAxiosStatus(err, 404)) {
            // Domain lookup uses `/api/domains/router/lookup`; portfolio fetch uses `/api/portfolios/:id`
            const url = err.config?.url ?? '';
            if (url.includes('/api/domains/router/lookup')) {
              console.log('Domain not found');
              setLoadError('not_found');
            } else {
              setLoadError('portfolio_unavailable');
            }
            return;
          }
          if (isAxiosStatus(err, 403)) {
            setLoadError('portfolio_unavailable');
            return;
          }
        }
        console.error('Domain lookup failed:', err);
        setLoadError('network');
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

  if (loadError) {
    return <DomainErrorScreen kind={loadError} />;
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
