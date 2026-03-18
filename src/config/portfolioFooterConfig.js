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

/**
 * Get site map links for a portfolio type, with basePath applied for route-based links.
 * @param {string} portfolioType - e.g. HealthcarePortfolio, HandymanMainPortfolio
 * @param {string} [basePath] - e.g. /portfolios/healthcare/abc123
 * @returns {Array<{label: string, path: string}>}
 */
export function getSiteMapLinks(portfolioType, basePath = "") {
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
