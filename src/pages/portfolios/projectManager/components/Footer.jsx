import React from "react";
import PortfolioFooter from "../../../../components/PortfolioFooter/PortfolioFooter";

export default function Footer({ siteName, showBranding = true, socialLinks }) {
  return (
    <PortfolioFooter
      portfolioType="ProjectManagerPortfolio"
      siteName={siteName}
      showBranding={showBranding}
      socialLinks={socialLinks}
      variant="dark"
    />
  );
}
