const AGENT_THEME_PRESETS = {
  aurora: {
    page: "#0b1020",
    pageAlt: "#121a33",
    pageAccent: "rgba(91, 157, 255, 0.22)",
    panel: "rgba(18, 27, 50, 0.88)",
    panelAlt: "rgba(28, 40, 70, 0.92)",
    text: "#edf4ff",
    muted: "#9eb0cf",
    accent: "#7dd3fc",
    accentStrong: "#c084fc",
    border: "rgba(157, 181, 255, 0.2)",
    shadow: "0 24px 60px rgba(7, 12, 27, 0.35)",
  },
  sunrise: {
    page: "#20110f",
    pageAlt: "#3b1f19",
    pageAccent: "rgba(255, 183, 77, 0.2)",
    panel: "rgba(57, 30, 27, 0.88)",
    panelAlt: "rgba(75, 39, 33, 0.92)",
    text: "#fff6ef",
    muted: "#f1cab9",
    accent: "#fb7185",
    accentStrong: "#f59e0b",
    border: "rgba(255, 222, 173, 0.18)",
    shadow: "0 24px 60px rgba(33, 12, 7, 0.32)",
  },
  paper: {
    page: "#f4efe6",
    pageAlt: "#ece4d6",
    pageAccent: "rgba(118, 148, 255, 0.16)",
    panel: "rgba(255, 250, 242, 0.9)",
    panelAlt: "rgba(248, 241, 228, 0.96)",
    text: "#1f2937",
    muted: "#5f6b7a",
    accent: "#2563eb",
    accentStrong: "#7c3aed",
    border: "rgba(31, 41, 55, 0.12)",
    shadow: "0 24px 60px rgba(107, 114, 128, 0.18)",
  },
  forest: {
    page: "#0a1410",
    pageAlt: "#12251c",
    pageAccent: "rgba(74, 222, 128, 0.18)",
    panel: "rgba(18, 36, 28, 0.88)",
    panelAlt: "rgba(24, 48, 36, 0.92)",
    text: "#ecfdf5",
    muted: "#a7d4c8",
    accent: "#4ade80",
    accentStrong: "#facc15",
    border: "rgba(167, 243, 208, 0.16)",
    shadow: "0 24px 60px rgba(5, 18, 12, 0.35)",
  },
  ocean: {
    page: "#0a1620",
    pageAlt: "#0f2840",
    pageAccent: "rgba(56, 189, 248, 0.2)",
    panel: "rgba(15, 35, 55, 0.88)",
    panelAlt: "rgba(20, 45, 75, 0.92)",
    text: "#e0f2fe",
    muted: "#93c5cf",
    accent: "#22d3ee",
    accentStrong: "#38bdf8",
    border: "rgba(125, 211, 252, 0.2)",
    shadow: "0 24px 60px rgba(5, 18, 35, 0.35)",
  },
  midnight: {
    page: "#0f0a1a",
    pageAlt: "#1a1230",
    pageAccent: "rgba(192, 132, 252, 0.22)",
    panel: "rgba(35, 20, 60, 0.88)",
    panelAlt: "rgba(48, 28, 75, 0.92)",
    text: "#faf5ff",
    muted: "#d8b4fe",
    accent: "#e879f9",
    accentStrong: "#a78bfa",
    border: "rgba(216, 180, 254, 0.2)",
    shadow: "0 24px 60px rgba(20, 10, 40, 0.4)",
  },
  clay: {
    page: "#1c1210",
    pageAlt: "#2a1a16",
    pageAccent: "rgba(251, 146, 60, 0.15)",
    panel: "rgba(55, 35, 30, 0.88)",
    panelAlt: "rgba(70, 42, 35, 0.92)",
    text: "#fff7ed",
    muted: "#fdba74",
    accent: "#fb923c",
    accentStrong: "#f97316",
    border: "rgba(253, 186, 116, 0.2)",
    shadow: "0 24px 60px rgba(40, 20, 15, 0.32)",
  },
  slate: {
    page: "#111827",
    pageAlt: "#1f2937",
    pageAccent: "rgba(148, 163, 184, 0.15)",
    panel: "rgba(31, 41, 55, 0.9)",
    panelAlt: "rgba(51, 65, 85, 0.92)",
    text: "#f8fafc",
    muted: "#94a3b8",
    accent: "#38bdf8",
    accentStrong: "#f472b6",
    border: "rgba(148, 163, 184, 0.2)",
    shadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
  },
  rose: {
    page: "#1a1018",
    pageAlt: "#2a1820",
    pageAccent: "rgba(244, 114, 182, 0.18)",
    panel: "rgba(50, 30, 45, 0.88)",
    panelAlt: "rgba(65, 38, 55, 0.92)",
    text: "#fdf2f8",
    muted: "#f9a8d4",
    accent: "#f472b6",
    accentStrong: "#e879f9",
    border: "rgba(251, 207, 232, 0.2)",
    shadow: "0 24px 60px rgba(40, 15, 30, 0.32)",
  },
};

/**
 * Normalizes a CSS color to #rrggbb for <input type="color"> (presets may use rgba).
 */
export function themeColorToHexForInput(color) {
  if (color == null || typeof color !== "string") return "#808080";
  const s = color.trim();
  if (s.startsWith("#")) {
    if (s.length === 7) return s.toLowerCase();
    if (s.length === 9) return `#${s.slice(1, 7)}`.toLowerCase();
    if (s.length === 4) {
      const r = s[1];
      const g = s[2];
      const b = s[3];
      return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }
  }
  const rgba = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgba) {
    const r = Math.min(255, Math.max(0, parseInt(rgba[1], 10)));
    const g = Math.min(255, Math.max(0, parseInt(rgba[2], 10)));
    const b = Math.min(255, Math.max(0, parseInt(rgba[3], 10)));
    return `#${[r, g, b]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
      .toLowerCase()}`;
  }
  return "#808080";
}

function toCssVars(tokens) {
  return {
    "--agent-page": tokens.page,
    "--agent-page-alt": tokens.pageAlt,
    "--agent-page-accent": tokens.pageAccent,
    "--agent-panel": tokens.panel,
    "--agent-panel-alt": tokens.panelAlt,
    "--agent-text": tokens.text,
    "--agent-muted": tokens.muted,
    "--agent-accent": tokens.accent,
    "--agent-accent-strong": tokens.accentStrong,
    "--agent-border": tokens.border,
    "--agent-shadow": tokens.shadow,
  };
}

export function resolveAgentTheme(themeId, themeTokens = {}) {
  const presetKey = themeId && AGENT_THEME_PRESETS[themeId] ? themeId : "aurora";
  const preset = AGENT_THEME_PRESETS[presetKey];
  const merged = {
    ...preset,
    ...(themeTokens && typeof themeTokens === "object" ? themeTokens : {}),
  };

  return {
    themeId: presetKey,
    vars: toCssVars(merged),
  };
}

export { AGENT_THEME_PRESETS };
