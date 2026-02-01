import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PortfolioPage from '../pages/portfolios/projectManager/pages/PortfolioPage';

function DomainRouter({ children }) {
    const [domainRoute, setDomainRoute] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkDomain = async () => {
        const hostname = window.location.hostname;
        
        // Don't redirect for your main domain
        if (hostname === 'findvirtual.me' || hostname === 'localhost') {
            setLoading(false);
            return;
        }

        try {
            // Call backend to get portfolio info for this domain
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

    if (loading) {
        return <div>Loading...</div>;
    }

    // If custom domain, render the portfolio directly
    if (domainRoute) {
        return <PortfolioPage 
        portfolioId={domainRoute.portfolioId} 
        portfolioType={domainRoute.portfolioType} 
        />;
    }

     // Otherwise, render normal app with routing
    return children;
}

export default DomainRouter;