import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';

// Healthcare imports
import HealthcareHome from "../pages/portfolios/healthcare/pages/Home.jsx";
import HealthcareServices from "../pages/portfolios/healthcare/pages/Services.jsx";
import HealthcareBlog from "../pages/portfolios/healthcare/pages/blog/Blog.jsx";
import HealthcareBlogPost from "../pages/portfolios/healthcare/pages/blog/BlogPost.jsx";
import HealthcareContact from "../pages/portfolios/healthcare/pages/Contact.jsx";
import HealthcareGallery from "../pages/portfolios/healthcare/pages/Gallery.jsx";
import HealthcareSearch from "../pages/portfolios/healthcare/pages/SearchResults.jsx";
import HealthcareAdminDashboard from "../pages/portfolios/healthcare/pages/admin/AdminDashboard.jsx";
import Landing from "../pages/portfolios/healthcare/pages/Landing.jsx";
import { Navigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import WidgetOverlay from '../components/WidgetOverlay/WidgetOverlay.jsx';
// Other portfolio imports
import HandymanPage from "../pages/portfolios/handyman/HandyManPage.jsx";
import EditHandymanPortfolio from '../pages/portfolios/handyman/EditHandymanPortfolio.jsx';
import PortfolioPage from '../pages/portfolios/projectManager/pages/PortfolioPage';
import { BrowserRouter } from 'react-router-dom';
import { PortfolioProvider } from '../context/PortfolioContext.jsx';

//wrapper for widget overaly
//must also wrap the portfolio page route with PortfolioProvider to provide context to the widgets
function WidgetOverlayWrapper() {
    return (
        <>
        {<WidgetOverlay />}
        <Outlet />
        </>
    );
}

function DomainRouter({ children }) {
  const [domainRoute, setDomainRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkDomain = async () => {
      const hostname = window.location.hostname;
      
      if (hostname === 'findvirtual.me' || hostname === 'staging.findvirtual.me') {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_API}/domainRouter/domainLookup?domain=${hostname}`
        );
        if (response.data.portfolioId) {
          setDomainRoute(response.data);
        }
      } catch (err) {
        if(err.status === 404){
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

  if (loading) return <div>Loading...</div>;


  // Custom domain routing
if (domainRoute) {
    console.log(domainRoute)
    const { portfolioType, portfolioId } = domainRoute;

    if (portfolioType === 'Healthcare') {
        return (
            <PortfolioProvider
                initialPortfolioId={portfolioId}
                initialPortfolioType="HealthcarePortfolio"
                isCustomDomain={true}
            >
                <Routes>
                    {/* Root-level routes for clean URLs: customDomain.com, customDomain.com/services, etc. */}
                    <Route path="/" element={<WidgetOverlayWrapper />}>
                        <Route index element={<HealthcareHome />} />
                        <Route path="services" element={<HealthcareServices />} />
                        <Route path="blog" element={<HealthcareBlog />} />
                        <Route path="blog/:id" element={<HealthcareBlogPost />} />
                        <Route path="gallery" element={<HealthcareGallery />} />
                        <Route path="contact" element={<HealthcareContact />} />
                        <Route path="admin/dashboard" element={<HealthcareAdminDashboard />} />
                    </Route>
                </Routes>
            </PortfolioProvider>
        );
        }

        if (portfolioType === 'Handyman') {
            return (
                <Routes>
                <Route path="/" element={<Navigate to={`/portfolios/handyman/${portfolioId}`} replace />} />
                <Route
                    path="/portfolios/handyman/:id"
                    element={
                    <PortfolioProvider>
                        <WidgetOverlayWrapper />
                    </PortfolioProvider>
                    }
                >
                    <Route index element={<HandymanPage />} />
                    <Route path="edit" element={<EditHandymanPortfolio />} />
                </Route>
                </Routes>
            );
        }

        if (portfolioType === 'ProjectManager') {
            return (
                <Routes>
                <Route path="/" element={<Navigate to={`/portfolios/ProjectManager/${portfolioId}`} replace />} />
                <Route
                    path="/portfolios/ProjectManager/:id"
                    element={
                    <PortfolioProvider>
                        <WidgetOverlayWrapper />
                    </PortfolioProvider>
                    }
                >
                    <Route index element={<PortfolioPage />} />
                </Route>
                </Routes>
            );
        }
    }

        return children;
    }

export default DomainRouter;