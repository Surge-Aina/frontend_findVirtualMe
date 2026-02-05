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
// Other portfolio imports
import HandymanPage from "../pages/portfolios/handyman/HandyManPage.jsx";
import PortfolioPage from '../pages/portfolios/projectManager/pages/PortfolioPage';
import { BrowserRouter } from 'react-router-dom';
function DomainRouter({ children }) {
  const [domainRoute, setDomainRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkDomain = async () => {
      const hostname = window.location.hostname;
      
      if (hostname === 'findvirtual.me' || hostname === 'localhost') {
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
        // <BrowserRouter>
            <Routes>
                <Route
        path="/"
        element={
          <Navigate
            to={`/portfolios/healthcare/${portfolioId}`}
            replace
          />
        }
      />

                {/* Public Routes - No Auth */}
                <Route path="/portfolios/healthcare" element={<Landing />} />
                <Route path="/portfolios/healthcare/search" element={<HealthcareSearch />} />
                
                {/* Demo Routes - No Auth */}
                <Route path="/portfolios/healthcare/demo" element={<HealthcareHome />} />
                <Route path="/portfolios/healthcare/demo/services" element={<HealthcareServices />} />
                <Route path="/portfolios/healthcare/demo/blog" element={<HealthcareBlog />} />
                <Route path="/portfolios/healthcare/demo/blog/:id" element={<HealthcareBlogPost />} />
                <Route path="/portfolios/healthcare/demo/gallery" element={<HealthcareGallery />} />
                <Route path="/portfolios/healthcare/demo/contact" element={<HealthcareContact />} />
                
                {/* User Portfolio Routes - Protected */}
                <Route 
                    path="/portfolios/healthcare/:practiceId" 
                    element={
               
                        <HealthcareHome />
                    } 
                />
                <Route 
                    path="/portfolios/healthcare/:practiceId/services" 
                    element={
                        <HealthcareServices />
                    } 
                />
                <Route 
                    path="/portfolios/healthcare/:practiceId/blog" 
                    element={
                        <HealthcareBlog />
                    } 
                />
                <Route 
                    path="/portfolios/healthcare/:practiceId/blog/:id" 
                    element={
                        <HealthcareBlogPost />
                    } 
                />
                <Route 
                    path="/portfolios/healthcare/:practiceId/gallery" 
                    element={
                        <HealthcareGallery />
                    } 
                />
                <Route 
                    path="/portfolios/healthcare/:practiceId/contact" 
                    element={
                        <HealthcareContact />
                    } 
                />
                <Route 
                    path="/portfolios/healthcare/:practiceId/admin/dashboard" 
                    element={
                        <HealthcareAdminDashboard />
                    } 
                />
            </Routes>
        // </BrowserRouter>
        );
        }

        if (portfolioType === 'Handyman') {
            return <HandymanPage portfolioId={portfolioId} />;
        }

        if (portfolioType === 'ProjectManager') {
            return <PortfolioPage portfolioId={portfolioId} />;
        }
    }

        return children;
    }

export default DomainRouter;