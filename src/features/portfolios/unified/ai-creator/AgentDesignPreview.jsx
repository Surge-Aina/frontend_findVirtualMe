import { resolveAgentTheme } from "../portfolioThemes/agentThemeResolver";

/**
 * Small abstract preview of agent theme colors + layout mode (not real portfolio content).
 */
export function AgentDesignPreview({ themeId, themeTokens, layoutMode }) {
  const { vars } = resolveAgentTheme(themeId, themeTokens);
  const mode = layoutMode || "stacked";

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
      <div className="px-2.5 py-1.5 bg-slate-50 border-b border-gray-100">
        <p className="text-[11px] font-medium text-slate-700">Look preview</p>
        <p className="text-[10px] text-slate-500 leading-snug">
          Colors and layout mode only — not your real sections.
        </p>
      </div>
      <div className="p-2 bg-gray-100">
        <div
          className="relative mx-auto overflow-hidden rounded-md shadow-sm"
          style={{
            ...vars,
            width: "100%",
            maxWidth: "280px",
            height: "132px",
            fontSize: "7px",
            lineHeight: 1.2,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "var(--agent-page)",
              color: "var(--agent-text)",
            }}
          >
            {mode === "singleSection" ? <SingleSectionMini /> : <StackedMini />}
          </div>
        </div>
      </div>
    </div>
  );
}

function StackedMini() {
  return (
    <div
      style={{
        padding: "8px",
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <div
        style={{
          height: "28%",
          borderRadius: "4px",
          background: "linear-gradient(120deg, var(--agent-panel) 0%, var(--agent-panel-alt) 100%)",
          border: "1px solid var(--agent-border)",
          boxShadow: "var(--agent-shadow)",
          position: "relative",
          padding: "6px 6px 4px",
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            display: "block",
            width: "38%",
            height: "4px",
            borderRadius: "2px",
            background: "var(--agent-accent)",
            marginBottom: "3px",
          }}
        />
        <div
          style={{
            color: "var(--agent-text)",
            fontSize: "8px",
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "0.01em",
          }}
        >
          Your name
        </div>
        <div
          style={{
            color: "var(--agent-text)",
            fontSize: "6px",
            marginTop: "2px",
            lineHeight: 1.2,
          }}
        >
          Short intro line
        </div>
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          borderRadius: "4px",
          background: "var(--agent-panel)",
          border: "1px solid var(--agent-border)",
          padding: "6px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <div style={{ color: "var(--agent-accent-strong)", fontSize: "7px", fontWeight: 700 }}>Section title</div>
        <div style={{ color: "var(--agent-text)", fontSize: "6px", lineHeight: 1.25, marginTop: "1px" }}>
          Body uses your text color.
        </div>
        <span style={{ width: "100%", height: "2px", borderRadius: "1px", background: "var(--agent-muted)", opacity: 0.35 }} />
        <div style={{ marginTop: "auto", display: "flex", gap: "4px" }}>
          <span style={{ flex: 1, height: "12px", borderRadius: "2px", background: "var(--agent-panel-alt)", border: "1px solid var(--agent-border)" }} />
          <span style={{ flex: 1, height: "12px", borderRadius: "2px", background: "var(--agent-panel-alt)", border: "1px solid var(--agent-border)" }} />
        </div>
      </div>
      <div
        style={{
          height: "14%",
          borderRadius: "4px",
          background: "var(--agent-panel-alt)",
          border: "1px solid var(--agent-border)",
          opacity: 0.95,
        }}
      />
    </div>
  );
}

function SingleSectionMini() {
  return (
    <div
      style={{
        padding: "8px",
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        gap: "6px",
      }}
    >
      <div
        style={{
          width: "18%",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          paddingTop: "2px",
        }}
        aria-hidden
      >
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            style={{
              height: "6px",
              borderRadius: "2px",
              background: i === 2 ? "var(--agent-accent)" : "var(--agent-muted)",
              opacity: i === 2 ? 0.85 : 0.35,
              border: i === 2 ? "1px solid var(--agent-border)" : "none",
            }}
          />
        ))}
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          borderRadius: "4px",
          background: "var(--agent-panel)",
          border: "1px solid var(--agent-border)",
          boxShadow: "var(--agent-shadow)",
          padding: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        <span
          style={{
            display: "block",
            width: "40%",
            height: "4px",
            borderRadius: "2px",
            background: "var(--agent-accent)",
            marginBottom: "2px",
          }}
        />
        <div style={{ color: "var(--agent-text)", fontSize: "8px", fontWeight: 700, lineHeight: 1.15 }}>Active section</div>
        <div style={{ color: "var(--agent-text)", fontSize: "6px", marginTop: "2px", lineHeight: 1.2 }}>
          Same text color here.
        </div>
        <span style={{ width: "100%", height: "2px", borderRadius: "1px", background: "var(--agent-muted)", opacity: 0.35 }} />
        <div
          style={{
            marginTop: "4px",
            flex: 1,
            borderRadius: "3px",
            background: "linear-gradient(180deg, var(--agent-page-accent) 0%, transparent 70%)",
            border: "1px dashed var(--agent-border)",
            opacity: 0.9,
          }}
        />
      </div>
    </div>
  );
}
