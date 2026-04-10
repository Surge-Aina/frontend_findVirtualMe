import PortfolioFooter from "../../../../features/portfolios/unified/PortfolioFooter/PortfolioFooter";
import { useHealthcareBasePath } from '../../../../hooks/useHealthcareBasePath';

export default function Footer({ userData, practiceId: practiceIdProp }) {
  const { basePath, practiceId: practiceIdFromHook } = useHealthcareBasePath();
  const practiceId = practiceIdProp ?? practiceIdFromHook;
  const resolvedBasePath = basePath !== undefined && basePath !== null ? basePath : (practiceId ? `/portfolios/healthcare/${practiceId}` : "");
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
      basePath={resolvedBasePath}
      siteName={siteName}
      showBranding={showBranding}
      socialLinks={socialLinks}
      variant="dark"
      className="border-t border-gray-700 mt-auto"
    />
  );
}
