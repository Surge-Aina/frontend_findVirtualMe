/**
 * Shared shell: contexts, API clients, cross-cutting utils, and global layout chrome.
 * Prefer importing from `@/shared/...` paths; this barrel is optional for convenience.
 */
export { AuthProvider, AuthContext } from "./context/AuthContext.jsx";
export { ThemeProvider, useTheme } from "./context/ThemeContext.jsx";
export {
  PortfolioProvider,
  usePortfolio,
  PortfolioContext,
} from "./context/PortfolioContext.jsx";

export { default as axiosAuth } from "./api/axiosAuth.js";
export { portfolioApi } from "./api/portfolioApi.js";

export { default as Layout } from "./components/Layout.jsx";
export { default as Footer } from "./components/Footer.jsx";
export { default as Navbar } from "./components/Navbar.jsx";
export { default as ErrorBoundary } from "./components/ErrorBoundary.jsx";
export { default as CookieConsent } from "./components/CookieConsent.jsx";
export { default as CookieSettings } from "./components/CookieSettings.jsx";
export { default as TelemetryVisit } from "./components/TelemetryVisit.jsx";
export { default as Tip } from "./components/Tip.jsx";
export { default as FloatingHelpButton } from "./components/FloatingHelpButton.jsx";

export { default as DomainRouter } from "./utils/DomainRouter.jsx";
export * from "./utils/portfolioEditLogger.js";
export { getBrowserHostname } from "./utils/windowHost.js";
export { useHandleCardClick } from "./utils/useHandleCardClick.js";
export { portfolioTypeToModel } from "./utils/portfolioTypeToModel.js";

export { PLATFORM_PRIVACY_POLICY_LAST_UPDATED } from "./legal/platformLegalContent.js";
export { default as PlatformPrivacyPolicyEmbed } from "./legal/PlatformPrivacyPolicyEmbed.jsx";
