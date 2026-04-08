import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaLock,
  FaMagic,
} from "react-icons/fa";
import { FieldEditor } from "./PortfolioEditorFields";
import { AgentDesignPreview } from "./AgentDesignPreview";
import { themeColorToHexForInput } from "./portfolioThemes/agentThemeResolver";
import {
  AGENT_THEME_OPTIONS,
  LAYOUT_MODE_OPTIONS,
} from "./portfolioEditorConfig";
import {
  DEFAULT_NAV_BRAND_ICON_KEY,
  mergeNavBrandDefaults,
  NAV_BRAND_ICON_OPTIONS,
  NavBrandIconPreview,
} from "./PortfolioNavBrand";

export function PortfolioSiteSettingsPanel({ portfolio, setPortfolio, nb, sl, setSocialLink }) {
  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
        <h3 className="font-semibold text-gray-900 text-sm">Settings</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="font-medium text-gray-700">Public / private:</span> use the visibility toggle on the
          Dashboard for this portfolio. It is not changed from this screen.
        </p>

        <div className="text-xs font-semibold text-gray-700 pt-3 border-t space-y-2">
          <p>Navbar logo</p>
          <p className="text-xs font-normal text-gray-500">
            Optional icon or initials shown beside the portfolio title in the sticky section navigation.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { mode: "none", label: "None" },
              { mode: "icon", label: "Icon" },
              { mode: "initials", label: "Initials" },
            ].map(({ mode, label }) => (
              <button
                key={mode}
                type="button"
                onClick={() =>
                  setPortfolio((p) => ({
                    ...p,
                    navBrand: {
                      ...mergeNavBrandDefaults(p.navBrand),
                      mode,
                      iconKey: mergeNavBrandDefaults(p.navBrand).iconKey || DEFAULT_NAV_BRAND_ICON_KEY,
                    },
                  }))
                }
                className={`rounded-lg px-2.5 py-1 text-xs font-medium border ${
                  nb.mode === mode
                    ? "border-blue-600 bg-blue-50 text-blue-800"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {nb.mode === "icon" ? (
            <div className="max-h-52 overflow-y-auto rounded-lg border border-gray-200 p-2 grid grid-cols-4 gap-1.5">
              {NAV_BRAND_ICON_OPTIONS.map(({ key, label }) => {
                const selected = nb.iconKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    title={label}
                    onClick={() =>
                      setPortfolio((p) => ({
                        ...p,
                        navBrand: { ...mergeNavBrandDefaults(p.navBrand), mode: "icon", iconKey: key },
                      }))
                    }
                    className={`flex h-11 items-center justify-center rounded-md border text-lg ${
                      selected
                        ? "border-blue-600 bg-blue-50 text-blue-800"
                        : "border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span className="sr-only">{label}</span>
                    <NavBrandIconPreview iconKey={key} />
                  </button>
                );
              })}
            </div>
          ) : null}
          {nb.mode === "initials" ? (
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Letters (max 2)</label>
                <input
                  type="text"
                  maxLength={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={nb.initialsText}
                  onChange={(e) =>
                    setPortfolio((p) => ({
                      ...p,
                      navBrand: {
                        ...mergeNavBrandDefaults(p.navBrand),
                        mode: "initials",
                        initialsText: e.target.value.slice(0, 2),
                      },
                    }))
                  }
                  placeholder="AB"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { fill: "color", label: "Color fill" },
                  { fill: "image", label: "Picture background" },
                ].map(({ fill, label }) => (
                  <button
                    key={fill}
                    type="button"
                    onClick={() =>
                      setPortfolio((p) => ({
                        ...p,
                        navBrand: { ...mergeNavBrandDefaults(p.navBrand), mode: "initials", initialsFill: fill },
                      }))
                    }
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium border ${
                      nb.initialsFill === fill
                        ? "border-blue-600 bg-blue-50 text-blue-800"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {nb.initialsFill === "color" ? (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Background color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      className="h-9 w-12 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
                      value={
                        /^#[0-9A-Fa-f]{6}$/.test(nb.initialsBgColor || "")
                          ? nb.initialsBgColor
                          : "#2563eb"
                      }
                      onChange={(e) =>
                        setPortfolio((p) => ({
                          ...p,
                          navBrand: {
                            ...mergeNavBrandDefaults(p.navBrand),
                            mode: "initials",
                            initialsBgColor: e.target.value,
                          },
                        }))
                      }
                    />
                    <input
                      type="text"
                      className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                      placeholder="#2563eb or rgb(...)"
                      value={nb.initialsBgColor}
                      onChange={(e) =>
                        setPortfolio((p) => ({
                          ...p,
                          navBrand: {
                            ...mergeNavBrandDefaults(p.navBrand),
                            mode: "initials",
                            initialsBgColor: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              ) : (
                <FieldEditor
                  label="Background image URL"
                  value={nb.initialsBgImageUrl}
                  onChange={(v) =>
                    setPortfolio((p) => ({
                      ...p,
                      navBrand: {
                        ...mergeNavBrandDefaults(p.navBrand),
                        mode: "initials",
                        initialsFill: "image",
                        initialsBgImageUrl: v,
                      },
                    }))
                  }
                  placeholder="https://... or /uploads/..."
                />
              )}
            </div>
          ) : null}
        </div>

        <p className="text-xs font-semibold text-gray-700 pt-2 border-t">Social links</p>
        <FieldEditor label="GitHub" value={sl.github} onChange={(v) => setSocialLink("github", v)} />
        <FieldEditor label="LinkedIn" value={sl.linkedin} onChange={(v) => setSocialLink("linkedin", v)} />
        <FieldEditor label="Twitter" value={sl.twitter} onChange={(v) => setSocialLink("twitter", v)} />
        <FieldEditor label="Instagram" value={sl.instagram} onChange={(v) => setSocialLink("instagram", v)} />
        <FieldEditor label="Website" value={sl.website} onChange={(v) => setSocialLink("website", v)} />
      </div>

      <div className="pt-3 border-t border-gray-100 space-y-2">
        <p className="text-xs font-semibold text-gray-700">Page banner defaults</p>
        <p className="text-xs text-gray-500">
          Optional background image and gradient applied to any section with a page banner when that section does not set
          its own.
        </p>
        <FieldEditor
          label="Default background image URL"
          value={(portfolio.pageBannerDefaults && portfolio.pageBannerDefaults.backgroundImage) || ""}
          onChange={(v) =>
            setPortfolio((prev) => ({
              ...prev,
              pageBannerDefaults: { ...(prev.pageBannerDefaults || {}), backgroundImage: v },
            }))
          }
          placeholder="https://... or /uploads/..."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Default gradient from (hex)</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="#1d4ed8"
              value={(portfolio.pageBannerDefaults && portfolio.pageBannerDefaults.gradientFrom) || ""}
              onChange={(e) =>
                setPortfolio((prev) => ({
                  ...prev,
                  pageBannerDefaults: { ...(prev.pageBannerDefaults || {}), gradientFrom: e.target.value },
                }))
              }
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Default gradient to (hex)</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="#1e3a8a"
              value={(portfolio.pageBannerDefaults && portfolio.pageBannerDefaults.gradientTo) || ""}
              onChange={(e) =>
                setPortfolio((prev) => ({
                  ...prev,
                  pageBannerDefaults: { ...(prev.pageBannerDefaults || {}), gradientTo: e.target.value },
                }))
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}

export function PortfolioAgentDesignPanel({
  portfolio,
  setPortfolio,
  activeThemePreset,
  clearThemeOverrides,
  setThemeToken,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
      <h3 className="font-semibold text-gray-900 text-sm">Design</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Theme preset</label>
        <select
          value={portfolio.themeId || "aurora"}
          onChange={(e) =>
            setPortfolio((prev) => ({
              ...prev,
              themeId: e.target.value,
            }))
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          {AGENT_THEME_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Layout mode</label>
        <div className="space-y-2">
          {LAYOUT_MODE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex items-start gap-3 rounded-lg border px-3 py-3 cursor-pointer ${
                (portfolio.layoutMode || "stacked") === option.value
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="layoutMode"
                checked={(portfolio.layoutMode || "stacked") === option.value}
                onChange={() =>
                  setPortfolio((prev) => ({
                    ...prev,
                    layoutMode: option.value,
                  }))
                }
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-gray-800">{option.label}</span>
                <span className="block text-xs text-gray-500">{option.description}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-800">Custom colors</p>
            <p className="text-xs text-gray-500">These values override the current preset until you reset them.</p>
          </div>
          <button
            type="button"
            onClick={clearThemeOverrides}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Reset colors
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-gray-700">
            Page
            <input
              type="color"
              value={portfolio.themeTokens?.page || activeThemePreset.page}
              onChange={(e) => setThemeToken("page", e.target.value)}
              className="mt-1 h-10 w-full rounded border border-gray-300"
            />
          </label>
          <label className="text-sm text-gray-700">
            Text
            <input
              type="color"
              value={portfolio.themeTokens?.text || activeThemePreset.text}
              onChange={(e) => setThemeToken("text", e.target.value)}
              className="mt-1 h-10 w-full rounded border border-gray-300"
            />
          </label>
          <label className="text-sm text-gray-700">
            Accent
            <input
              type="color"
              value={portfolio.themeTokens?.accent || activeThemePreset.accent}
              onChange={(e) => setThemeToken("accent", e.target.value)}
              className="mt-1 h-10 w-full rounded border border-gray-300"
            />
          </label>
          <label className="text-sm text-gray-700">
            Accent strong
            <input
              type="color"
              value={portfolio.themeTokens?.accentStrong || activeThemePreset.accentStrong}
              onChange={(e) => setThemeToken("accentStrong", e.target.value)}
              className="mt-1 h-10 w-full rounded border border-gray-300"
            />
          </label>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-700 mb-2">Blocks</p>
          <p className="text-xs text-gray-500 mb-2">Card and section surfaces (overrides the preset until reset).</p>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-gray-700">
              Block
              <input
                type="color"
                value={themeColorToHexForInput(portfolio.themeTokens?.panel ?? activeThemePreset.panel)}
                onChange={(e) => setThemeToken("panel", e.target.value)}
                className="mt-1 h-10 w-full rounded border border-gray-300"
              />
            </label>
            <label className="text-sm text-gray-700">
              Block alt
              <input
                type="color"
                value={themeColorToHexForInput(portfolio.themeTokens?.panelAlt ?? activeThemePreset.panelAlt)}
                onChange={(e) => setThemeToken("panelAlt", e.target.value)}
                className="mt-1 h-10 w-full rounded border border-gray-300"
              />
            </label>
          </div>
        </div>
      </div>

      <AgentDesignPreview
        themeId={portfolio.themeId}
        themeTokens={portfolio.themeTokens}
        layoutMode={portfolio.layoutMode}
      />
    </div>
  );
}

export function PortfolioPublishReadinessPanel({ readiness }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-gray-900 text-sm">Publish readiness</h3>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            readiness.score >= 85
              ? "bg-emerald-100 text-emerald-800"
              : readiness.score >= 60
                ? "bg-amber-100 text-amber-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          Score {readiness.score}
        </span>
      </div>
      {readiness.issues.length > 0 ? (
        <div className="space-y-2">
          {readiness.issues.map((issue) => (
            <div key={issue} className="flex items-start gap-2 text-sm text-amber-900">
              <FaExclamationTriangle className="mt-0.5 shrink-0 text-amber-500" />
              <span>{issue}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-emerald-700">No major readiness issues found.</p>
      )}
      {readiness.positives.length > 0 && (
        <div className="pt-2 border-t border-gray-100 space-y-2">
          {readiness.positives.slice(0, 3).map((positive) => (
            <div key={positive} className="flex items-start gap-2 text-sm text-emerald-800">
              <FaCheckCircle className="mt-0.5 shrink-0 text-emerald-500" />
              <span>{positive}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PortfolioAgentAiPanel({
  aiAccessLoading,
  hasAiAccess,
  aiUsage,
  aiEditShortcuts,
  handleGenerateAiProposal,
  aiProposalDisabled,
  aiInstruction,
  setAiInstruction,
  aiLoading,
  handleApplyAiProposal,
  saveDisabled,
  aiProposal,
  portfolio,
  sections,
  aiProposalDiff,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">Ask AI</h3>
          <p className="text-xs text-gray-500 mt-1">
            Generates a proposal from your current portfolio so you can review before applying.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
          <FaMagic className="text-[10px]" /> Premium
        </span>
      </div>

      {aiAccessLoading ? (
        <p className="text-sm text-gray-500">Checking subscription access...</p>
      ) : hasAiAccess ? (
        <>
          {aiUsage && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm text-slate-800">
                <span className="font-semibold">{aiUsage.remaining}</span> AI edit
                {aiUsage.remaining === 1 ? "" : "s"} remaining this month
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Used {aiUsage.used} of {aiUsage.limit} monthly proposals.
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {aiEditShortcuts.map((shortcut) => (
              <button
                key={shortcut}
                type="button"
                onClick={() => handleGenerateAiProposal(shortcut)}
                disabled={aiProposalDisabled}
                className="rounded-full border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {shortcut}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Edit instruction</label>
            <textarea
              rows={4}
              value={aiInstruction}
              onChange={(e) => setAiInstruction(e.target.value)}
              placeholder='Example: Make this feel more minimal, switch to single-section, and replace any overly salesy copy with a more polished tone.'
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => handleGenerateAiProposal()}
              disabled={aiProposalDisabled}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-white hover:bg-violet-700 disabled:opacity-50"
            >
              <FaMagic /> {aiLoading ? "Generating proposal..." : "Generate AI proposal"}
            </button>
            {(aiUsage?.remaining ?? 1) <= 0 && (
              <p className="text-xs text-amber-700">You have used all AI edit proposals for this month.</p>
            )}
          </div>

          {aiProposal?.changes && (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-violet-950">Proposal preview</h4>
                  <p className="text-xs text-violet-700">
                    Source: {aiProposal.source === "openai" ? "AI" : "Fallback composer"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleApplyAiProposal}
                  disabled={saveDisabled}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  <FaCheckCircle /> Apply
                </button>
              </div>

              <div className="space-y-2">
                {aiProposal.changes.summary.map((item) => (
                  <div key={item} className="text-sm text-violet-900">
                    {item}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-white p-3 border border-violet-100">
                  <p className="font-semibold text-gray-800">Theme</p>
                  <p className="text-gray-600">
                    {portfolio.themeId || "aurora"} {"->"} {aiProposal.proposal.themeId}
                  </p>
                </div>
                <div className="rounded-lg bg-white p-3 border border-violet-100">
                  <p className="font-semibold text-gray-800">Layout</p>
                  <p className="text-gray-600">
                    {portfolio.layoutMode || "stacked"} {"->"} {aiProposal.proposal.layoutMode}
                  </p>
                </div>
                <div className="rounded-lg bg-white p-3 border border-violet-100">
                  <p className="font-semibold text-gray-800">Visible sections now</p>
                  <p className="text-gray-600">{sections.filter((section) => section.visible !== false).length}</p>
                </div>
                <div className="rounded-lg bg-white p-3 border border-violet-100">
                  <p className="font-semibold text-gray-800">Visible sections proposed</p>
                  <p className="text-gray-600">
                    {(aiProposal.proposal.sections || []).filter((section) => section.visible !== false).length}
                  </p>
                </div>
              </div>

              {aiProposalDiff.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-violet-100">
                  <p className="text-sm font-semibold text-violet-950">Section-by-section diff</p>
                  {aiProposalDiff.map((item) => (
                    <div key={`${item.type}-${item.status}`} className="rounded-lg border border-violet-100 bg-white p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            item.status === "added"
                              ? "bg-emerald-100 text-emerald-800"
                              : item.status === "removed"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-2 text-xs">
                        <div>
                          <p className="font-semibold text-gray-700">Before</p>
                          <p className="mt-1 text-gray-600">{item.beforePreview}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700">After</p>
                          <p className="mt-1 text-gray-600">{item.afterPreview}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <FaLock className="mt-0.5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-900">AI editing is reserved for paid subscriptions</p>
              <p className="text-sm text-amber-800 mt-1">
                Manual editing stays available to everyone. Upgrade if you want natural-language portfolio revisions with
                proposal previews.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
