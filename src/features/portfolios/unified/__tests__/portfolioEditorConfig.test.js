import {
  BLOCK_LABELS,
  LAYOUT_MODE_OPTIONS,
  getDefaultBlockData,
  toCreateSections,
  getReadinessReport,
  getSectionPreview,
  getAiProposalDiff,
} from "../portfolioEditorConfig";

describe("portfolioEditorConfig", () => {
  describe("BLOCK_LABELS", () => {
    it("includes core block keys", () => {
      expect(BLOCK_LABELS.hero).toBe("Hero");
      expect(BLOCK_LABELS.contact).toBe("Contact");
      expect(BLOCK_LABELS.dashboardChart).toBe("Data Visualization");
    });
  });

  describe("LAYOUT_MODE_OPTIONS", () => {
    it("lists stacked and singleSection modes", () => {
      const values = LAYOUT_MODE_OPTIONS.map((o) => o.value);
      expect(values).toEqual(["stacked", "singleSection"]);
    });
  });

  describe("getDefaultBlockData", () => {
    it("merges pageBanner defaults for hero agent", () => {
      const d = getDefaultBlockData("hero", "agent");
      expect(d.name).toBe("Your Name");
      expect(d.pageBanner).toEqual({
        enabled: false,
        bannerBackground: "gradient",
      });
    });

    it("returns handyman gallery defaults when template is handyman", () => {
      const d = getDefaultBlockData("gallery", "handyman");
      expect(d.sectionTitle).toBe("Selected work");
      expect(Array.isArray(d.items)).toBe(true);
    });

    it("returns healthcare-style gallery for non-handyman", () => {
      const d = getDefaultBlockData("gallery", "healthcare");
      expect(d.facilityImages).toBeDefined();
    });

    it("returns empty object for unknown block type", () => {
      expect(getDefaultBlockData("unknownType")).toEqual({
        pageBanner: { enabled: false, bannerBackground: "gradient" },
      });
    });
  });

  describe("toCreateSections", () => {
    it("assigns order and clones data", () => {
      const out = toCreateSections([
        { type: "hero", data: { title: "A" }, visible: true },
        { type: "contact", data: { email: "x@y.com" } },
      ]);
      expect(out[0]).toMatchObject({ type: "hero", order: 0, visible: true });
      expect(out[0].data).toEqual({ title: "A" });
      expect(out[0].data).not.toBe(
        toCreateSections([{ type: "hero", data: { title: "A" } }])[0].data
      );
      expect(out[1].order).toBe(1);
    });
  });

  describe("getReadinessReport", () => {
    it("flags missing title and rewards good sections", () => {
      const report = getReadinessReport({
        title: "",
        sections: [
          { type: "hero", visible: true, data: {} },
          { type: "contact", visible: true, data: { email: "a@b.com" } },
        ],
      });
      expect(report.issues.some((i) => /title/i.test(i))).toBe(true);
      expect(report.positives.length).toBeGreaterThan(0);
    });

    it("warns on broken social link value", () => {
      const report = getReadinessReport({
        title: "OK",
        sections: [{ type: "hero", visible: true, data: { name: "N" } }],
        socialLinks: { twitter: "not-a-valid-url" },
      });
      expect(report.issues.some((i) => /twitter/i.test(i))).toBe(true);
    });
  });

  describe("getSectionPreview", () => {
    it("summarizes section data", () => {
      expect(
        getSectionPreview({
          type: "skills",
          visible: true,
          data: { items: ["A", "B"] },
        })
      ).toMatch(/A/);
    });

    it("returns placeholder when empty or hidden", () => {
      expect(getSectionPreview(null)).toBe("Not present");
      expect(
        getSectionPreview({ type: "seo", visible: false, data: {} })
      ).toBe("Hidden section");
    });
  });

  describe("getAiProposalDiff", () => {
    it("returns added and removed sections", () => {
      const diff = getAiProposalDiff(
        { sections: [{ type: "hero", order: 0, data: {}, visible: true }] },
        { sections: [] }
      );
      const removed = diff.find((d) => d.type === "hero");
      expect(removed?.status).toBe("removed");

      const diff2 = getAiProposalDiff(
        { sections: [] },
        { sections: [{ type: "contact", order: 0, data: { email: "x@y.com" }, visible: true }] }
      );
      const added = diff2.find((d) => d.type === "contact");
      expect(added?.status).toBe("added");
    });
  });
});
