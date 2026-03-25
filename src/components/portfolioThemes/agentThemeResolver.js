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
};

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
