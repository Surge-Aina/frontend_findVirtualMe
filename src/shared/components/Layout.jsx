import Navbar from "./Navbar";
import { useLocation } from "react-router-dom";

/** Unified portfolio public view: /portfolios/view/:id (not /edit). */
const UNIFIED_PORTFOLIO_VIEW_RE = /^\/portfolios\/view\/[^/]+\/?$/;

export default function Layout({ children }) {
  const location = useLocation();
  const isUnifiedPortfolioViewOnly = UNIFIED_PORTFOLIO_VIEW_RE.test(location.pathname);
  const showNavbar = !isUnifiedPortfolioViewOnly;

  return (
    <>
      {showNavbar && <Navbar />}
      <main
        className={`min-h-screen w-full bg-white dark:bg-neutral-950 ${showNavbar ? "pt-20" : ""}`}
      >
        {children}
      </main>
    </>
  );
}
