import PortfolioFooter from "../../../../components/PortfolioFooter/PortfolioFooter";

export default function Footer({ userData, practiceId }) {
  const basePath = practiceId ? `/portfolios/healthcare/${practiceId}` : "";
  const siteName = userData?.practice?.name || "";
  const showBranding = !userData?.hideBranding;
  const socialLinks = userData?.socialLinks || userData?.ui?.social
    ? {
        linkedin: userData?.socialLinks?.linkedin || userData?.ui?.social?.linkedin,
        twitter: userData?.socialLinks?.twitter || userData?.ui?.social?.twitter,
        instagram: userData?.socialLinks?.instagram || userData?.ui?.social?.instagram,
        website: userData?.socialLinks?.website,
        github: userData?.socialLinks?.github,
      }
    : null;

  return (
    <PortfolioFooter
      portfolioType="HealthcarePortfolio"
      basePath={basePath}
      siteName={siteName}
      showBranding={showBranding}
      socialLinks={socialLinks}
      variant="dark"
      className="border-t border-gray-700 mt-auto"
    />
  );
}
