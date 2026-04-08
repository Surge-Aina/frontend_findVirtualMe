import { useState, useEffect } from "react";
import { FaFileAlt, FaBars, FaTimes } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { SECTION_LABELS } from "./sectionNavLabels";
import { PortfolioNavBrandMark } from "./PortfolioNavBrand";

/**
 * Sticky anchor nav for all v2 portfolio templates (replaces ProjectManager-only nav).
 */
export default function PortfolioSectionNav({
  sections = [],
  template,
  summaryData = {},
  singleSectionView = false,
  activeSectionType = null,
  brandTitle = "Portfolio",
  navBrand = null,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const disabled = import.meta.env.VITE_V2_PORTFOLIO_FULL_NAV === "false";

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (disabled) return null;

  const sorted = [...sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const hasHero = sorted.some((s) => s.type === "hero");
  const seen = new Set();
  const links = [];
  for (const s of sorted) {
    const id = s.type;
    if (seen.has(id)) continue;
    // Legacy-style healthcare home: stats sit under hero on one page — no separate Stats tab
    if (template === "healthcare" && id === "stats" && hasHero) continue;
    seen.add(id);
    links.push({
      id,
      label: SECTION_LABELS[s.type] || s.type,
    });
  }

  const resumeUrl = summaryData?.resumeUrl;
  if (template === "projectManager" && resumeUrl) {
    links.push({ id: "resume", label: "Resume", href: resumeUrl, external: true });
  }

  if (template === "dataScientist" && resumeUrl) {
    links.push({ id: "resume", label: "Resume", href: resumeUrl, external: true });
  }

  if (template === "agent" && resumeUrl) {
    links.push({ id: "resume", label: "Resume", href: resumeUrl, external: true });
  }

  if (links.length === 0) return null;

  const barClass =
    template === "projectManager"
      ? "sticky top-0 z-50 border-b border-white/10 bg-slate-800/95 backdrop-blur-md shadow-md"
      : template === "dataScientist"
        ? "sticky top-0 z-50 border-b border-[color:var(--ds-border)] bg-[color:var(--ds-surface)]/95 backdrop-blur-md shadow-md font-mono"
        : template === "agent"
          ? "sticky top-0 z-50 border-b border-[color:var(--agent-border)] bg-[color:var(--agent-panel)]/90 backdrop-blur-md shadow-md"
        : template === "handyman"
          ? "sticky top-0 z-50 border-b border-amber-200/80 bg-amber-50/95 backdrop-blur-md shadow-sm"
          : "sticky top-0 z-50 border-b border-blue-100 bg-white/95 backdrop-blur-md shadow-sm";

  const linkClass =
    template === "projectManager"
      ? "text-sm sm:text-base text-slate-200 hover:text-white px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
      : template === "dataScientist"
        ? "text-sm sm:text-base text-[var(--ds-text-muted)] hover:text-[var(--ds-accent)] px-3 py-2 rounded-md hover:bg-[var(--ds-accent-dim)] transition-colors"
        : template === "agent"
          ? "text-sm sm:text-base text-[var(--agent-muted)] hover:text-[var(--agent-accent)] px-3 py-2 rounded-md hover:bg-white/5 transition-colors"
        : template === "handyman"
          ? "text-sm sm:text-base text-amber-900 hover:text-amber-700 px-3 py-2 rounded-md hover:bg-amber-100/80 transition-colors"
          : "text-sm sm:text-base text-gray-700 hover:text-blue-700 px-3 py-2 rounded-md hover:bg-blue-50 transition-colors";

  const linkClassActive =
    template === "projectManager"
      ? "text-sm sm:text-base text-white font-semibold px-3 py-2 rounded-md bg-white/15 ring-1 ring-white/20"
      : template === "dataScientist"
        ? "text-sm sm:text-base text-[var(--ds-accent)] font-semibold px-3 py-2 rounded-md bg-[var(--ds-accent-dim)] ring-1 ring-[var(--ds-accent)]/30"
        : template === "agent"
          ? "text-sm sm:text-base text-[var(--agent-text)] font-semibold px-3 py-2 rounded-md bg-white/10 ring-1 ring-[color:var(--agent-border)]"
        : template === "handyman"
          ? "text-sm sm:text-base text-amber-950 font-semibold px-3 py-2 rounded-md bg-amber-200/90 ring-1 ring-amber-300"
          : "text-sm sm:text-base text-blue-800 font-semibold px-3 py-2 rounded-md bg-blue-100 ring-1 ring-blue-200";

  const titleClass =
    template === "projectManager"
      ? "text-white font-semibold text-base sm:text-lg w-full sm:w-auto sm:flex-1 sm:min-w-0 break-words sm:pr-4 leading-snug"
      : template === "dataScientist"
        ? "text-[var(--ds-text)] font-semibold text-base sm:text-lg w-full sm:w-auto sm:flex-1 sm:min-w-0 break-words sm:pr-4 leading-snug"
        : template === "agent"
          ? "text-[var(--agent-text)] font-semibold text-base sm:text-lg w-full sm:w-auto sm:flex-1 sm:min-w-0 break-words sm:pr-4 leading-snug"
          : template === "handyman"
            ? "text-amber-950 font-semibold text-base sm:text-lg w-full sm:w-auto sm:flex-1 sm:min-w-0 break-words sm:pr-4 leading-snug"
            : "text-gray-900 font-semibold text-base sm:text-lg w-full sm:w-auto sm:flex-1 sm:min-w-0 break-words sm:pr-4 leading-snug";

  const goToSection = (typeId) => {
    navigate({
      pathname: location.pathname,
      search: location.search,
      hash: `#${typeId}`,
    });
  };

  const isActive = (typeId) => {
    if (!singleSectionView) return false;
    const hashId = location.hash.replace(/^#/, "");
    const healthcareHomeMerged =
      template === "healthcare" &&
      typeId === "hero" &&
      sorted.some((s) => s.type === "hero") &&
      sorted.some((s) => s.type === "stats");
    if (healthcareHomeMerged && (hashId === "hero" || hashId === "stats")) return true;
    if (hashId) return hashId === typeId;
    return activeSectionType === typeId;
  };

  const mobileLinkExtra = " w-full justify-start sm:justify-start";
  const mobilePanelClass =
    template === "projectManager"
      ? "border-t border-white/10 bg-slate-800/98"
      : template === "dataScientist"
        ? "border-t border-[color:var(--ds-border)] bg-[color:var(--ds-surface)]/98"
        : template === "agent"
          ? "border-t border-[color:var(--agent-border)] bg-[color:var(--agent-panel)]/95"
          : template === "handyman"
            ? "border-t border-amber-200/80 bg-amber-50/98"
            : "border-t border-blue-100 bg-white/98";

  return (
    <header className={barClass} aria-label="Section navigation">
      <div className="max-w-5xl mx-auto px-3 sm:px-5 py-3.5 sm:py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
          <div className="flex min-w-0 flex-1 items-center justify-between gap-2 md:min-w-0 md:justify-start md:pr-2">
            <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
              <PortfolioNavBrandMark navBrand={navBrand} template={template} />
              <span className={`${titleClass} min-w-0`}>{brandTitle || "Portfolio"}</span>
            </div>
            <button
              type="button"
              className={`md:hidden shrink-0 rounded-md p-2 -mr-1 ${
                template === "projectManager"
                  ? "text-slate-200 hover:bg-white/10"
                  : template === "dataScientist"
                    ? "text-[var(--ds-text-muted)] hover:bg-[var(--ds-accent-dim)]"
                    : template === "agent"
                      ? "text-[var(--agent-muted)] hover:bg-white/5"
                      : template === "handyman"
                        ? "text-amber-900 hover:bg-amber-100/80"
                        : "text-gray-700 hover:bg-blue-50"
              }`}
              aria-expanded={mobileOpen}
              aria-controls="portfolio-section-nav-panel"
              onClick={() => setMobileOpen((o) => !o)}
            >
              <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
              {mobileOpen ? <FaTimes className="h-5 w-5" aria-hidden /> : <FaBars className="h-5 w-5" aria-hidden />}
            </button>
          </div>

        <nav
          className="hidden shrink-0 flex-wrap justify-end gap-1.5 sm:gap-2 md:flex md:max-w-[65%] md:justify-end"
          aria-label="On-page sections"
        >
          {links.map(({ id, label, href, external }) =>
            external ? (
              <a
                key={id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkClass} inline-flex items-center gap-1`}
              >
                <FaFileAlt className="text-xs sm:text-sm opacity-80 shrink-0" /> {label}
              </a>
            ) : singleSectionView ? (
              <button
                key={id}
                type="button"
                onClick={() => goToSection(id)}
                className={isActive(id) ? linkClassActive : linkClass}
                aria-current={isActive(id) ? "page" : undefined}
              >
                {label}
              </button>
            ) : (
              <a key={id} href={`#${id}`} className={linkClass}>
                {label}
              </a>
            )
          )}
        </nav>
        </div>

        {mobileOpen ? (
          <div id="portfolio-section-nav-panel" className={`md:hidden mt-3 -mx-3 sm:-mx-5 px-3 sm:px-5 py-3 rounded-b-lg ${mobilePanelClass}`}>
            <nav className="flex flex-col gap-1" aria-label="On-page sections">
              {links.map(({ id, label, href, external }) =>
                external ? (
                  <a
                    key={id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${linkClass} inline-flex items-center gap-1${mobileLinkExtra}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <FaFileAlt className="text-xs sm:text-sm opacity-80 shrink-0" /> {label}
                  </a>
                ) : singleSectionView ? (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      goToSection(id);
                      setMobileOpen(false);
                    }}
                    className={`${isActive(id) ? linkClassActive : linkClass}${mobileLinkExtra} text-left`}
                    aria-current={isActive(id) ? "page" : undefined}
                  >
                    {label}
                  </button>
                ) : (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={`${linkClass}${mobileLinkExtra}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {label}
                  </a>
                )
              )}
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
