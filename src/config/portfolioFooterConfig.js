/**
 * Footer configuration per portfolio type.
 * Each type defines siteMapLinks - path can be a route (e.g. "/services") or anchor (e.g. "#contact").
 * For routes, basePath is prepended; for anchors, path is used as-is.
 */

export const portfolioFooterConfig = {
  HealthcarePortfolio: {
    siteMapLinks: [
      { label: "Home", path: "" },
      { label: "Services", path: "/services" },
      { label: "Blog", path: "/blog" },
      { label: "Gallery", path: "/gallery" },
      { label: "Contact", path: "/contact" },
    ],
    usesBasePath: true,
  },
  HandymanMainPortfolio: {
    siteMapLinks: [
      { label: "Services", path: "#services" },
      { label: "Our Work", path: "#portfolio" },
      { label: "Contact", path: "#contact" },
    ],
    usesBasePath: false,
  },
  ProjectManagerPortfolio: {
    siteMapLinks: [{ label: "Contact", path: "#contact" }],
    usesBasePath: false,
  },
};

const SECTION_TO_LINK = {
  hero: { label: "Home", path: "#hero" },
  summary: { label: "Summary", path: "#summary" },
  skills: { label: "Skills", path: "#skills" },
  experience: { label: "Experience", path: "#experience" },
  education: { label: "Education", path: "#education" },
  projects: { label: "Projects", path: "#projects" },
  services: { label: "Services", path: "#services" },
  gallery: { label: "Gallery", path: "#gallery" },
  blog: { label: "Blog", path: "#blog" },
  contact: { label: "Contact", path: "#contact" },
  testimonials: { label: "Testimonials", path: "#testimonials" },
  stats: { label: "Stats", path: "#stats" },
  hours: { label: "Hours", path: "#hours" },
  process: { label: "Process", path: "#process" },
  seo: { label: "SEO", path: "#seo" },
  dashboardChart: { label: "Chart", path: "#dashboardChart" },
  dashboardTable: { label: "Table", path: "#dashboardTable" },
  caseStudy: { label: "Case Study", path: "#caseStudy" },
};

/**
 * Get site map links for a portfolio type, with basePath applied for route-based links.
 * Also accepts a sections array (unified model) to derive links automatically.
 * @param {string} portfolioType - e.g. HealthcarePortfolio, HandymanMainPortfolio, or template key
 * @param {string} [basePath] - e.g. /portfolios/healthcare/abc123
 * @param {Array} [sections] - portfolio sections array (unified model)
 * @returns {Array<{label: string, path: string}>}
 */
export function getSiteMapLinks(portfolioType, basePath = "", sections) {
  // If sections are provided (unified model), derive links from them
  if (sections && Array.isArray(sections)) {
    const seen = new Set();
    return [...sections]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((s) => SECTION_TO_LINK[s.type])
      .filter((link) => {
        if (!link) return false;
        if (seen.has(link.path)) return false;
        seen.add(link.path);
        return true;
      });
  }

  const config = portfolioFooterConfig[portfolioType];
  if (!config) return [];

  return config.siteMapLinks.map(({ label, path }) => {
    if (!config.usesBasePath || path.startsWith("#")) {
      return { label, path: path || "#" };
    }
    const base = basePath.replace(/\/$/, "");
    if (!path) return { label, path: base };
    const route = path.startsWith("/") ? path : `/${path}`;
    return { label, path: `${base}${route}` };
  });
}
