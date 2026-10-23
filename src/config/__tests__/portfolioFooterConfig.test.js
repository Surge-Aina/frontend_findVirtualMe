import { portfolioFooterConfig, getSiteMapLinks } from "../portfolioFooterConfig";

describe("portfolioFooterConfig", () => {
  it("defines expected portfolio types", () => {
    expect(portfolioFooterConfig.HealthcarePortfolio.usesBasePath).toBe(true);
    expect(portfolioFooterConfig.HandymanMainPortfolio.usesBasePath).toBe(false);
    expect(portfolioFooterConfig.ProjectManagerPortfolio.siteMapLinks).toHaveLength(1);
  });
});

describe("getSiteMapLinks", () => {
  describe("legacy config (no sections)", () => {
    it("returns empty array for unknown portfolio type", () => {
      expect(getSiteMapLinks("UnknownType")).toEqual([]);
    });

    it("prepends basePath for HealthcarePortfolio routes", () => {
      const links = getSiteMapLinks(
        "HealthcarePortfolio",
        "/portfolios/healthcare/abc"
      );
      expect(links.find((l) => l.label === "Home")).toEqual({
        label: "Home",
        path: "/portfolios/healthcare/abc",
      });
      expect(links.find((l) => l.label === "Services")).toEqual({
        label: "Services",
        path: "/portfolios/healthcare/abc/services",
      });
    });

    it("strips trailing slash from basePath", () => {
      const links = getSiteMapLinks("HealthcarePortfolio", "/base/");
      expect(links[0].path).toBe("/base");
    });

    it("returns anchor paths unchanged for HandymanMainPortfolio", () => {
      const links = getSiteMapLinks("HandymanMainPortfolio", "/ignored");
      expect(links.map((l) => l.path)).toEqual(["#services", "#portfolio", "#contact"]);
    });
  });

  describe("unified model (sections array)", () => {
    it("derives ordered links from section types and dedupes by path", () => {
      const sections = [
        { type: "hero", order: 0 },
        { type: "contact", order: 2 },
        { type: "services", order: 1 },
      ];
      const links = getSiteMapLinks("HealthcarePortfolio", "", sections);
      expect(links.map((l) => l.path)).toEqual(["#hero", "#services", "#contact"]);
    });

    it("for healthcare-like types with hero, filters out stats sections", () => {
      const sections = [
        { type: "hero", order: 0 },
        { type: "stats", order: 1 },
        { type: "contact", order: 2 },
      ];
      const links = getSiteMapLinks("healthcare", "", sections);
      expect(links.some((l) => l.path === "#stats")).toBe(false);
      expect(links.some((l) => l.path === "#contact")).toBe(true);
    });

    it("includes stats when portfolioType is not healthcare-like", () => {
      const sections = [
        { type: "stats", order: 0 },
        { type: "contact", order: 1 },
      ];
      const links = getSiteMapLinks("OtherPortfolio", "", sections);
      expect(links.map((l) => l.path)).toContain("#stats");
    });

    it("skips unknown section types", () => {
      const sections = [{ type: "unknownSection", order: 0 }];
      expect(getSiteMapLinks("HealthcarePortfolio", "", sections)).toEqual([]);
    });
  });
});
