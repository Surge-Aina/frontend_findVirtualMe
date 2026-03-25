import { useEffect, useState, useContext, useMemo } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import BLOCK_COMPONENTS from "./blocks";
import { portfolioApi } from "../api/portfolioApi";
import PortfolioFooter from "./PortfolioFooter/PortfolioFooter";
import WidgetOverlay from "./WidgetOverlay/WidgetOverlay";
import { usePortfolio } from "../context/PortfolioContext";
import { PortfolioViewProvider } from "../context/PortfolioViewContext";
import PortfolioSectionNav from "./PortfolioSectionNav";
import { AuthContext } from "../context/AuthContext";
import "./portfolioThemes/dataScientist.css";
import "./portfolioThemes/agent.css";
import { resolveAgentTheme } from "./portfolioThemes/agentThemeResolver";

const SINGLE_SECTION_VIEW_TEMPLATES = new Set(["healthcare", "projectManager", "dataScientist"]);

function filterVisibleSections(sections) {
  return (sections || []).filter((s) => s.visible !== false);
}

function getNavSectionTypesInOrder(sections) {
  const sorted = [...sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const seen = new Set();
  const types = [];
  for (const s of sorted) {
    if (seen.has(s.type)) continue;
    seen.add(s.type);
    types.push(s.type);
  }
  return types;
}

/** Active section type from hash, or first nav section if missing / invalid. */
function getActiveSectionType(sections, hash) {
  const navTypes = getNavSectionTypesInOrder(sections);
  const h = (hash || "").replace(/^#/, "");
  if (h && navTypes.includes(h)) return h;
  return navTypes[0] ?? null;
}

function renderSections(sections, template, options = {}) {
  const { activeSectionType } = options;
  const scrollClass =
    template === "projectManager" || template === "dataScientist" || template === "agent"
      ? "scroll-mt-[4.5rem]"
      : "scroll-mt-[3.5rem]";

  let list = filterVisibleSections(sections).sort((a, b) => a.order - b.order);
  if (activeSectionType) {
    list = list.filter((s) => s.type === activeSectionType);
  }

  return list.map((section) => {
    const Component = BLOCK_COMPONENTS[section.type];
    if (!Component) return null;
    const key = section._id || `section-${section.order}-${section.type}`;
    const inner = <Component template={template} {...section.data} />;

    return (
      <div key={key} id={section.type} className={scrollClass}>
        {inner}
      </div>
    );
  });
}

function OwnerEditBanner({ portfolio }) {
  const { user } = useContext(AuthContext);
  if (!portfolio?.owner || !user) return null;
  const ownerId = portfolio.owner.toString?.() || String(portfolio.owner);
  const uid = (user.id || user._id)?.toString?.() || String(user.id || user._id);
  if (ownerId !== uid) return null;

  return (
    <div className="bg-amber-100 border-b border-amber-300 text-center py-2 px-4 text-sm text-amber-950 z-[60] relative">
      You are viewing your portfolio.{" "}
      <Link to={`/portfolios/view/${portfolio._id}/edit`} className="font-semibold underline text-blue-700 hover:text-blue-900">
        Edit portfolio
      </Link>
    </div>
  );
}

function PortfolioViewInner({ portfolio }) {
  const location = useLocation();
  const isDataScientist = portfolio.template === "dataScientist";
  const isAgent = portfolio.template === "agent";
  const agentTheme = useMemo(
    () => (isAgent ? resolveAgentTheme(portfolio.themeId, portfolio.themeTokens) : null),
    [isAgent, portfolio.themeId, portfolio.themeTokens]
  );
  const shellClassName = isDataScientist
    ? "portfolio-theme-dataScientist"
    : isAgent
      ? "portfolio-theme-agent"
    : portfolio.template === "projectManager"
      ? "bg-slate-700 min-h-screen"
      : "min-h-screen";
  const shellStyle = isAgent ? agentTheme?.vars : undefined;

  const sections = useMemo(() => portfolio.sections || [], [portfolio.sections]);
  const visibleSections = useMemo(() => filterVisibleSections(sections), [sections]);
  const summarySection = visibleSections.find((s) => s.type === "summary");
  const singleSectionView = isAgent
    ? portfolio.layoutMode === "singleSection"
    : SINGLE_SECTION_VIEW_TEMPLATES.has(portfolio.template);
  const brandTitle = (portfolio.title && String(portfolio.title).trim()) || "Portfolio";

  const activeSectionType = useMemo(
    () => (singleSectionView ? getActiveSectionType(visibleSections, location.hash) : null),
    [singleSectionView, visibleSections, location.hash]
  );

  useEffect(() => {
    if (!singleSectionView || !activeSectionType) return;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [singleSectionView, activeSectionType]);

  return (
    <PortfolioViewProvider portfolio={portfolio}>
      <div className={shellClassName} style={shellStyle}>
        <OwnerEditBanner portfolio={portfolio} />
        <PortfolioSectionNav
          sections={visibleSections}
          template={portfolio.template}
          summaryData={summarySection?.data || {}}
          singleSectionView={singleSectionView}
          activeSectionType={activeSectionType}
          brandTitle={brandTitle}
        />
        <main className={isDataScientist || isAgent ? "flex-1 w-full min-w-0" : "w-full"}>
          {renderSections(sections, portfolio.template, {
            activeSectionType: singleSectionView ? activeSectionType : null,
          })}
        </main>

        <PortfolioFooter
          portfolioType={portfolio.template}
          siteName={portfolio.title}
          showBranding={!portfolio.hideBranding}
          socialLinks={portfolio.socialLinks}
          sections={visibleSections}
          siteMapAnchorBehavior={singleSectionView ? "hash" : "scroll"}
        />

        <WidgetOverlay />
      </div>
    </PortfolioViewProvider>
  );
}

export default function PortfolioRenderer({ portfolioData: prefetched }) {
  const { id } = useParams();
  const { setPortfolioId, setPortfolioType, setPortfolioOwner } = usePortfolio();

  const [portfolio, setPortfolio] = useState(prefetched || null);
  const [loading, setLoading] = useState(!prefetched);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (prefetched) {
      setPortfolio(prefetched);
      return;
    }
    if (!id) return;

    let cancelled = false;
    setLoading(true);

    portfolioApi
      .getById(id)
      .then((res) => {
        if (cancelled) return;
        setPortfolio(res.data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.data?.error || "Failed to load portfolio");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, prefetched]);

  useEffect(() => {
    if (!portfolio) return;
    setPortfolioId(portfolio._id);
    setPortfolioType(portfolio.template);
    if (portfolio.owner) {
      setPortfolioOwner((prev) => ({ ...prev, id: portfolio.owner }));
    }
  }, [portfolio, setPortfolioId, setPortfolioType, setPortfolioOwner]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Not Found</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!portfolio) return null;

  return <PortfolioViewInner portfolio={portfolio} />;
}
