import { createContext, useContext, useMemo } from "react";

const PortfolioViewContext = createContext(null);

/**
 * Read-only context for v2 portfolio view pages (renderer + blocks).
 * Provides portfolioId, template, owner id, and top-level social links for blocks.
 */
export function PortfolioViewProvider({ children, portfolio }) {
  const value = useMemo(() => {
    if (!portfolio) return null;
    const summarySection = (portfolio.sections || []).find((s) => s.type === "summary");
    const servicesSection = (portfolio.sections || []).find((s) => s.type === "services");
    return {
      portfolioId: portfolio._id,
      template: portfolio.template,
      ownerId: portfolio.owner,
      title: portfolio.title,
      socialLinks: portfolio.socialLinks || {},
      summaryData: summarySection?.data || {},
      servicesItems: servicesSection?.data?.items || [],
    };
  }, [portfolio]);

  return (
    <PortfolioViewContext.Provider value={value}>{children}</PortfolioViewContext.Provider>
  );
}

export function usePortfolioView() {
  return useContext(PortfolioViewContext);
}
