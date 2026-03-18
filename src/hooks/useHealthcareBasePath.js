import { useParams, useLocation } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';

/**
 * Returns basePath and practiceId for healthcare portfolio links.
 * On custom domains: basePath is "" (root), practiceId comes from context.
 * On findvirtual.me: basePath is /portfolios/healthcare/:practiceId, practiceId from URL params.
 * For demo routes: practiceId is "demo", basePath is /portfolios/healthcare/demo.
 */
export function useHealthcareBasePath() {
  const { practiceId: urlPracticeId } = useParams();
  const { pathname } = useLocation();
  const portfolioContext = usePortfolio();
  const { portfolioId, isCustomDomain } = portfolioContext || {};

  const isDemoRoute = pathname.includes('/portfolios/healthcare/demo');
  const practiceId = isCustomDomain ? portfolioId : (isDemoRoute ? 'demo' : urlPracticeId);
  const basePath = isCustomDomain ? '' : (practiceId ? `/portfolios/healthcare/${practiceId}` : '');

  return { basePath, practiceId };
}
