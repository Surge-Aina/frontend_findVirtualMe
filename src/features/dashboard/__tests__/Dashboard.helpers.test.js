import {
  getPortfolioDisplayName,
  getPortfolioTypeLabel,
  isAiPortfolio,
  collectStringsFromValue,
  stringsFromPortfolioSections,
  portfolioMatchesSearch,
  sortPortfolios,
  portfolioPageRange,
} from "../Dashboard";

describe("Dashboard helpers", () => {
  describe("getPortfolioDisplayName", () => {
    it("prefers healthcare practice name", () => {
      expect(
        getPortfolioDisplayName({
          portfolioType: "Healthcare",
          practice: { name: "Clinic" },
        })
      ).toBe("Clinic");
    });

    it("healthcare falls back through portfolioName and default label", () => {
      expect(
        getPortfolioDisplayName({
          portfolioType: "Healthcare",
          portfolioName: "PN",
        })
      ).toBe("PN");
      expect(getPortfolioDisplayName({ portfolioType: "Healthcare" })).toBe("Healthcare Portfolio");
    });

    it("non-healthcare prefers title then businessName, portfolioTitle, name, default", () => {
      expect(getPortfolioDisplayName({ title: "T" })).toBe("T");
      expect(getPortfolioDisplayName({ businessName: "B" })).toBe("B");
      expect(getPortfolioDisplayName({ portfolioTitle: "PT" })).toBe("PT");
      expect(getPortfolioDisplayName({ name: "N" })).toBe("N");
      expect(getPortfolioDisplayName({})).toBe("Untitled Portfolio");
    });
  });

  describe("getPortfolioTypeLabel", () => {
    it("marks AI from template or createdBy", () => {
      expect(getPortfolioTypeLabel({ template: "agent" })).toBe("AI Portfolio");
      expect(getPortfolioTypeLabel({ createdBy: "agent", template: "handyman" })).toBe("AI Portfolio");
    });

    it("falls back to template, portfolioType, or Portfolio", () => {
      expect(getPortfolioTypeLabel({ template: "handyman" })).toBe("handyman");
      expect(getPortfolioTypeLabel({ portfolioType: "Healthcare" })).toBe("Healthcare");
      expect(getPortfolioTypeLabel({})).toBe("Portfolio");
    });
  });

  it("isAiPortfolio", () => {
    expect(isAiPortfolio({ template: "agent" })).toBe(true);
    expect(isAiPortfolio({ createdBy: "agent" })).toBe(true);
    expect(isAiPortfolio({ template: "handyman" })).toBe(false);
  });

  describe("collectStringsFromValue", () => {
    it("handles primitives, arrays, objects, and depth limit", () => {
      expect(collectStringsFromValue(null)).toEqual([]);
      expect(collectStringsFromValue("a")).toEqual(["a"]);
      expect(collectStringsFromValue(42)).toEqual(["42"]);
      expect(collectStringsFromValue(true)).toEqual(["true"]);
      expect(collectStringsFromValue(["x", { y: "z" }])).toEqual(["x", "z"]);
      expect(collectStringsFromValue({}, 0, 0)).toEqual([]);
    });
  });

  describe("stringsFromPortfolioSections", () => {
    it("returns empty when sections missing or not array", () => {
      expect(stringsFromPortfolioSections({})).toEqual([]);
      expect(stringsFromPortfolioSections({ sections: null })).toEqual([]);
    });

    it("flattens section data strings", () => {
      expect(
        stringsFromPortfolioSections({
          sections: [{ data: { nested: { t: "deep" } } }],
        })
      ).toEqual(["deep"]);
    });
  });

  describe("portfolioMatchesSearch", () => {
    it("empty query matches all", () => {
      expect(portfolioMatchesSearch({ title: "A" }, "   ")).toBe(true);
    });

    it("matches slug, _id, contact, and social links", () => {
      const p = {
        title: "X",
        slug: "my-slug",
        _id: "507f1f77bcf86cd799439011",
        contact: { email: "c@x.com" },
        socialLinks: { website: "https://w.com", github: "g", linkedin: "l" },
      };
      expect(portfolioMatchesSearch(p, "my-slug")).toBe(true);
      expect(portfolioMatchesSearch(p, "507f1f77")).toBe(true);
      expect(portfolioMatchesSearch(p, "c@x")).toBe(true);
      expect(portfolioMatchesSearch(p, "w.com")).toBe(true);
      expect(portfolioMatchesSearch(p, "nomatchhere")).toBe(false);
    });
  });

  it("portfolioMatchesSearch scans nested sections", () => {
    const p = {
      title: "X",
      sections: [{ data: { email: "findme@x.com" } }],
    };
    expect(portfolioMatchesSearch(p, "findme")).toBe(true);
    expect(portfolioMatchesSearch(p, "zzz")).toBe(false);
  });

  describe("sortPortfolios", () => {
    const getName = (x) => x.name;
    const getType = () => "T";

    it("sorts by nameAsc", () => {
      const list = [{ name: "B" }, { name: "A" }];
      const sorted = sortPortfolios(list, "nameAsc", getName, getType);
      expect(sorted.map((x) => x.name)).toEqual(["A", "B"]);
    });

    it("sorts by nameDesc", () => {
      const list = [{ name: "A" }, { name: "B" }];
      const sorted = sortPortfolios(list, "nameDesc", getName, getType);
      expect(sorted.map((x) => x.name)).toEqual(["B", "A"]);
    });

    it("sorts by created and updated timestamps", () => {
      const list = [
        { name: "o", createdAt: "2020-01-01", updatedAt: "2020-01-01" },
        { name: "n", createdAt: "2021-01-01", updatedAt: "2022-01-01" },
      ];
      const newest = sortPortfolios(list, "createdNewest", getName, getType);
      expect(newest[0].name).toBe("n");
      const oldest = sortPortfolios(list, "createdOldest", getName, getType);
      expect(oldest[0].name).toBe("o");
      const recent = sortPortfolios(list, "updatedRecent", getName, getType);
      expect(recent[0].name).toBe("n");
    });

    it("sorts by typeAsc using template in tie-break", () => {
      const list = [
        { name: "a", template: "zebra" },
        { name: "a", template: "apple" },
      ];
      const sorted = sortPortfolios(list, "typeAsc", getName, getType);
      expect(sorted[0].template).toBe("apple");
    });

    it("falls back to updatedRecent for unknown sort key", () => {
      const list = [
        { name: "a", updatedAt: "2020-01-01" },
        { name: "b", updatedAt: "2021-01-01" },
      ];
      const sorted = sortPortfolios(list, "unknownKey", getName, getType);
      expect(sorted[0].name).toBe("b");
    });
  });

  describe("portfolioPageRange", () => {
    it("returns zeros when total is empty", () => {
      expect(portfolioPageRange(1, 0, 18)).toEqual({ start: 0, end: 0 });
    });

    it("pages non-empty totals", () => {
      expect(portfolioPageRange(1, 10, 18)).toEqual({ start: 1, end: 10 });
      expect(portfolioPageRange(2, 40, 18)).toEqual({ start: 19, end: 36 });
    });
  });
});
