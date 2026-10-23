import {
  resolveAgentTheme,
  themeColorToHexForInput,
  AGENT_THEME_PRESETS,
} from "../agentThemeResolver";

describe("agentThemeResolver", () => {
  describe("resolveAgentTheme", () => {
    it("falls back to aurora for unknown themeId", () => {
      const r = resolveAgentTheme("not-a-real-theme", {});
      expect(r.themeId).toBe("aurora");
      expect(r.vars["--agent-page"]).toBe(AGENT_THEME_PRESETS.aurora.page);
    });

    it("merges themeTokens over preset", () => {
      const r = resolveAgentTheme("aurora", { page: "#000000" });
      expect(r.vars["--agent-page"]).toBe("#000000");
    });
  });

  describe("themeColorToHexForInput", () => {
    it("handles 7-char hex", () => {
      expect(themeColorToHexForInput("#AaBbCc")).toBe("#aabbcc");
    });
    it("handles 4-char hex shorthand", () => {
      expect(themeColorToHexForInput("#abc")).toBe("#aabbcc");
    });
    it("handles 9-char hex (drops alpha for input)", () => {
      expect(themeColorToHexForInput("#aabbccdd")).toBe("#aabbcc");
    });
    it("handles rgb()", () => {
      expect(themeColorToHexForInput("rgb(10, 20, 30)")).toBe("#0a141e");
    });
    it("returns gray for invalid", () => {
      expect(themeColorToHexForInput(null)).toBe("#808080");
      expect(themeColorToHexForInput("nope")).toBe("#808080");
    });
  });
});
