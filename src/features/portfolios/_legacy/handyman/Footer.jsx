import React from "react";
import PortfolioFooter from "@/features/portfolios/unified/PortfolioFooter/PortfolioFooter";
import "./Footer.css";

export default function Footer({ siteName, showBranding = true, socialLinks }) {
  return (
    <PortfolioFooter
      portfolioType="HandymanMainPortfolio"
      siteName={siteName}
      showBranding={showBranding}
      socialLinks={socialLinks}
      variant="dark"
      className="footer"
    />
  );
}
