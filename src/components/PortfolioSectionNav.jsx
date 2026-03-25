import { FaFileAlt } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const SECTION_LABELS = {
  hero: "Home",
  summary: "Summary",
  stats: "Stats",
  services: "Services",
  gallery: "Gallery",
  blog: "Blog",
  contact: "Contact",
  hours: "Hours",
  seo: "SEO",
  skills: "Skills",
  experience: "Experience",
  education: "Education",
  projects: "Projects",
  testimonials: "Testimonials",
  process: "Process",
  dashboardChart: "Chart",
  dashboardTable: "Table",
};

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
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const disabled = import.meta.env.VITE_V2_PORTFOLIO_FULL_NAV === "false";
  if (disabled) return null;

  const sorted = [...sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const seen = new Set();
  const links = [];
  for (const s of sorted) {
    const id = s.type;
    if (seen.has(id)) continue;
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
      ? "text-xs sm:text-sm text-slate-200 hover:text-white px-2 py-1 rounded-md hover:bg-white/10 transition-colors"
      : template === "dataScientist"
        ? "text-xs sm:text-sm text-[var(--ds-text-muted)] hover:text-[var(--ds-accent)] px-2 py-1 rounded-md hover:bg-[var(--ds-accent-dim)] transition-colors"
        : template === "agent"
          ? "text-xs sm:text-sm text-[var(--agent-muted)] hover:text-[var(--agent-accent)] px-2 py-1 rounded-md hover:bg-white/5 transition-colors"
        : template === "handyman"
          ? "text-xs sm:text-sm text-amber-900 hover:text-amber-700 px-2 py-1 rounded-md hover:bg-amber-100/80 transition-colors"
          : "text-xs sm:text-sm text-gray-700 hover:text-blue-700 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors";

  const linkClassActive =
    template === "projectManager"
      ? "text-xs sm:text-sm text-white font-semibold px-2 py-1 rounded-md bg-white/15 ring-1 ring-white/20"
      : template === "dataScientist"
        ? "text-xs sm:text-sm text-[var(--ds-accent)] font-semibold px-2 py-1 rounded-md bg-[var(--ds-accent-dim)] ring-1 ring-[var(--ds-accent)]/30"
        : template === "agent"
          ? "text-xs sm:text-sm text-[var(--agent-text)] font-semibold px-2 py-1 rounded-md bg-white/10 ring-1 ring-[color:var(--agent-border)]"
        : template === "handyman"
          ? "text-xs sm:text-sm text-amber-950 font-semibold px-2 py-1 rounded-md bg-amber-200/90 ring-1 ring-amber-300"
          : "text-xs sm:text-sm text-blue-800 font-semibold px-2 py-1 rounded-md bg-blue-100 ring-1 ring-blue-200";

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
    if (hashId) return hashId === typeId;
    return activeSectionType === typeId;
  };

  return (
    <header className={barClass} aria-label="Section navigation">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <span
          className={
            template === "projectManager"
              ? "text-white font-semibold text-sm truncate max-w-[min(12rem,40vw)]"
              : template === "dataScientist"
                ? "text-[var(--ds-text)] font-semibold text-sm truncate max-w-[min(12rem,40vw)]"
                : template === "agent"
                  ? "text-[var(--agent-text)] font-semibold text-sm truncate max-w-[min(12rem,40vw)]"
                : template === "handyman"
                  ? "text-amber-950 font-semibold text-sm truncate max-w-[min(12rem,40vw)]"
                  : "text-gray-900 font-semibold text-sm truncate max-w-[min(12rem,40vw)]"
          }
        >
          {brandTitle || "Portfolio"}
        </span>
        <nav className="flex flex-wrap gap-1 sm:gap-1.5 justify-end" aria-label="On-page sections">
          {links.map(({ id, label, href, external }) =>
            external ? (
              <a
                key={id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkClass} inline-flex items-center gap-1`}
              >
                <FaFileAlt className="text-[10px] opacity-80" /> {label}
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
    </header>
  );
}
