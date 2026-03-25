/**
 * Dashboard-style chart section (unified data scientist template).
 * Renders a simple bar preview from numeric series — no external chart library.
 */
export default function ChartBlock({
  template,
  chartTitle,
  xAxisLabel,
  yAxisLabel,
  data: seriesWrapper,
  categories = [],
  categoryData = [],
  isActive,
}) {
  const series = seriesWrapper && typeof seriesWrapper === "object" ? seriesWrapper : {};
  const sales = Array.isArray(series.sales) ? series.sales : [];
  const revenue = Array.isArray(series.revenue) ? series.revenue : [];
  const xLabels = Array.isArray(series.xLabels) ? series.xLabels : [];
  const hiddenPoints = Array.isArray(series.hiddenPoints) ? series.hiddenPoints : [];
  const catList = Array.isArray(categories) ? categories : [];
  const catValues = Array.isArray(categoryData) ? categoryData : [];

  const maxBar = Math.max(1, ...sales.map(Number), ...revenue.map(Number), ...catValues.map(Number));

  const isDS = template === "dataScientist";
  const isAgent = template === "agent";
  const shell =
    "rounded-xl border p-6 shadow-lg " +
    (isDS
      ? "border-[color:var(--ds-border)] bg-[color:var(--ds-surface)]/80"
      : isAgent
        ? "border-[color:var(--agent-border)] bg-[color:var(--agent-panel)]"
      : "border-white/10 bg-slate-700/50");

  return (
    <section className={isDS ? "py-10 bg-transparent" : isAgent ? "py-12" : "py-12 bg-slate-800"}>
      <div className="max-w-5xl mx-auto px-4">
        <div className={shell}>
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
            <h2 className={`text-xl font-semibold ${isAgent ? "text-[color:var(--agent-text)]" : "text-white"}`}>{chartTitle || "Chart"}</h2>
            {isActive === false && (
              <span className={`text-xs uppercase tracking-wide ${isAgent ? "text-[color:var(--agent-muted)]" : "text-slate-500"}`}>Inactive</span>
            )}
          </div>
          {(xAxisLabel || yAxisLabel) && (
            <p className={`text-sm mb-4 ${isAgent ? "text-[color:var(--agent-muted)]" : "text-slate-400"}`}>
              {xAxisLabel && <span className="mr-4">X: {xAxisLabel}</span>}
              {yAxisLabel && <span>Y: {yAxisLabel}</span>}
            </p>
          )}

          {sales.length > 0 && (
            <div className="mb-8">
              <h3 className={`text-sm font-medium mb-3 ${isAgent ? "text-[color:var(--agent-text)]" : "text-slate-300"}`}>Sales</h3>
              <div className={`flex items-end gap-1 h-40 pb-1 ${isAgent ? "border-b border-[color:var(--agent-border)]" : "border-b border-white/10"}`}>
                {sales.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                    <div
                      className={`w-full rounded-t ${isDS ? "bg-emerald-500/80" : isAgent ? "bg-[color:var(--agent-accent)]" : "bg-blue-500/80"}`}
                      style={{ height: `${(Number(v) / maxBar) * 100}%`, minHeight: "4px" }}
                      title={String(v)}
                    />
                    <span className={`text-[10px] truncate w-full text-center ${isAgent ? "text-[color:var(--agent-muted)]" : "text-slate-500"}`}>
                      {xLabels[i] ?? i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {revenue.length > 0 && (
            <div className="mb-8">
              <h3 className={`text-sm font-medium mb-3 ${isAgent ? "text-[color:var(--agent-text)]" : "text-slate-300"}`}>Revenue</h3>
              <div className={`flex items-end gap-1 h-40 pb-1 ${isAgent ? "border-b border-[color:var(--agent-border)]" : "border-b border-white/10"}`}>
                {revenue.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                    <div
                      className="w-full rounded-t bg-cyan-500/70"
                      style={{ height: `${(Number(v) / maxBar) * 100}%`, minHeight: "4px" }}
                      title={String(v)}
                    />
                    <span className={`text-[10px] truncate w-full text-center ${isAgent ? "text-[color:var(--agent-muted)]" : "text-slate-500"}`}>
                      {xLabels[i] ?? i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {catList.length > 0 && catValues.length > 0 && (
            <div>
              <h3 className={`text-sm font-medium mb-3 ${isAgent ? "text-[color:var(--agent-text)]" : "text-slate-300"}`}>Categories</h3>
              <div className="space-y-2">
                {catList.map((cat, i) => {
                  const val = Number(catValues[i]) || 0;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className={`text-sm w-28 shrink-0 truncate ${isAgent ? "text-[color:var(--agent-muted)]" : "text-slate-400"}`}>{cat}</span>
                      <div className={`flex-1 h-2 rounded-full overflow-hidden ${isAgent ? "bg-white/10" : "bg-slate-600"}`}>
                        <div
                          className={
                            isDS ? "h-full bg-emerald-500/90 rounded-full" : isAgent ? "h-full bg-[color:var(--agent-accent-strong)] rounded-full" : "h-full bg-blue-500/90 rounded-full"
                          }
                          style={{ width: `${(val / maxBar) * 100}%` }}
                        />
                      </div>
                      <span className={`text-sm tabular-nums w-10 text-right ${isAgent ? "text-[color:var(--agent-text)]" : "text-slate-300"}`}>{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {hiddenPoints.length > 0 && (
            <p className={`text-xs mt-4 ${isAgent ? "text-[color:var(--agent-muted)]" : "text-slate-500"}`}>Hidden points: {hiddenPoints.join(", ")}</p>
          )}

          {sales.length === 0 && revenue.length === 0 && catList.length === 0 && (
            <p className={`text-sm border border-dashed rounded-lg px-4 py-6 text-center ${isAgent ? "text-[color:var(--agent-muted)] border-[color:var(--agent-border)]" : "text-slate-500 border-white/15"}`}>
              Add chart data in the portfolio editor.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
