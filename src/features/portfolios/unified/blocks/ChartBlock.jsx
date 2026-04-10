const DEFAULT_COLORS = ["#10b981", "#06b6d4", "#8b5cf6", "#f59e0b", "#ef4444"];

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeChartSeries(seriesWrapper) {
  const base = seriesWrapper && typeof seriesWrapper === "object" ? seriesWrapper : {};
  const providedSeries = Array.isArray(base.series) ? base.series : [];

  if (providedSeries.length > 0) {
    return providedSeries.map((item, index) => ({
      name: item?.name || item?.label || `Series ${index + 1}`,
      color: item?.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      values: Array.isArray(item?.values) ? item.values : Array.isArray(item?.data) ? item.data : [],
    }));
  }

  const legacySeries = [
    { name: "Sales", color: DEFAULT_COLORS[0], values: Array.isArray(base.sales) ? base.sales : [] },
    { name: "Revenue", color: DEFAULT_COLORS[1], values: Array.isArray(base.revenue) ? base.revenue : [] },
  ];

  return legacySeries.filter((item) => item.values.length > 0);
}

function normalizeSummaryItems(summaryItems, categories, categoryData) {
  if (Array.isArray(summaryItems) && summaryItems.length > 0) {
    return summaryItems.map((item, index) => ({
      label: item?.label || item?.name || `Item ${index + 1}`,
      value: toNumber(item?.value),
      color: item?.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    }));
  }

  const labels = Array.isArray(categories) ? categories : [];
  const values = Array.isArray(categoryData) ? categoryData : [];

  return labels.map((label, index) => ({
    label,
    value: toNumber(values[index]),
    color: DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));
}

function shouldHidePoint(hiddenPoints, index, label) {
  if (!Array.isArray(hiddenPoints) || hiddenPoints.length === 0) return false;

  return hiddenPoints.some((entry) => {
    if (typeof entry === "number") return entry === index;

    const normalized = String(entry).trim().toLowerCase();
    if (!normalized) return false;
    if (normalized === String(index).toLowerCase()) return true;
    if (normalized === String(index + 1).toLowerCase()) return true;
    return normalized === String(label).trim().toLowerCase();
  });
}

/**
 * Flexible chart + summary block for portfolio data visualizations.
 * Supports legacy sales/revenue data and a newer `data.series` array.
 */
export default function DataVisualizationBlock({
  template,
  chartTitle,
  sectionTitle,
  sectionIntro,
  xAxisLabel,
  yAxisLabel,
  summaryTitle,
  data: seriesWrapper,
  categories = [],
  categoryData = [],
  summaryItems = [],
  isActive,
}) {
  const series = seriesWrapper && typeof seriesWrapper === "object" ? seriesWrapper : {};
  const xLabels = Array.isArray(series.xLabels) ? series.xLabels : [];
  const hiddenPoints = Array.isArray(series.hiddenPoints) ? series.hiddenPoints : [];
  const chartSeries = normalizeChartSeries(series);
  const highlights = normalizeSummaryItems(summaryItems, categories, categoryData);

  const maxPointCount = Math.max(xLabels.length, ...chartSeries.map((item) => item.values.length), 0);
  const visiblePoints = Array.from({ length: maxPointCount }, (_, index) => {
    const label = xLabels[index] ?? `Item ${index + 1}`;
    if (shouldHidePoint(hiddenPoints, index, label)) return null;

    const values = chartSeries.map((item) => ({
      key: `${item.name}-${index}`,
      name: item.name,
      color: item.color,
      value: toNumber(item.values[index]),
      rawValue: item.values[index],
    }));

    return {
      key: `${label}-${index}`,
      label,
      values,
    };
  }).filter(Boolean);

  const maxBarValue = Math.max(
    1,
    ...visiblePoints.flatMap((point) => point.values.map((item) => item.value)),
    ...highlights.map((item) => item.value),
  );

  const hasChart = visiblePoints.length > 0 && chartSeries.length > 0;
  const hasHighlights = highlights.length > 0;
  const isDS = template === "dataScientist";
  const isAgent = template === "agent";
  const shell =
    "rounded-xl border p-6 shadow-lg " +
    (isDS
      ? "border-[color:var(--ds-border)] bg-[color:var(--ds-surface)]/80"
      : isAgent
        ? "border-[color:var(--agent-border)] bg-[color:var(--agent-panel)]"
        : "border-white/10 bg-slate-700/50");
  const titleClass = isAgent ? "text-[color:var(--agent-text)]" : "text-white";
  const mutedClass = isAgent ? "text-[color:var(--agent-muted)]" : "text-slate-400";
  const subtleClass = isAgent ? "text-[color:var(--agent-muted)]" : "text-slate-500";
  const borderClass = isAgent ? "border-[color:var(--agent-border)]" : "border-white/10";
  const surfaceClass = isAgent ? "bg-white/10" : "bg-slate-800/70";

  return (
    <section className={isDS ? "py-10 bg-transparent" : isAgent ? "py-12" : "py-12 bg-slate-800"}>
      <div className="max-w-5xl mx-auto px-4">
        <div className={shell}>
          <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
            <div className="space-y-2">
              <h2 className={`text-xl font-semibold ${titleClass}`}>{sectionTitle || chartTitle || "Performance Overview"}</h2>
              {sectionIntro && <p className={`text-sm max-w-3xl ${mutedClass}`}>{sectionIntro}</p>}
            </div>
            {isActive === false && (
              <span className={`text-xs uppercase tracking-wide ${subtleClass}`}>Inactive</span>
            )}
          </div>

          {(xAxisLabel || yAxisLabel) && (
            <p className={`text-sm mb-5 ${mutedClass}`}>
              {xAxisLabel && <span className="mr-4">X: {xAxisLabel}</span>}
              {yAxisLabel && <span>Y: {yAxisLabel}</span>}
            </p>
          )}

          {hasChart && (
            <div className="mb-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className={`text-sm font-medium ${isAgent ? "text-[color:var(--agent-text)]" : "text-slate-200"}`}>
                  Grouped Bar Chart
                </h3>
                <div className="flex flex-wrap gap-3">
                  {chartSeries.map((item) => (
                    <span key={item.name} className={`inline-flex items-center gap-2 text-xs ${mutedClass}`}>
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className={`rounded-xl border ${borderClass} ${surfaceClass} p-4 overflow-x-auto`}>
                <div className="flex items-end gap-4 min-h-[18rem]" style={{ minWidth: `${Math.max(visiblePoints.length * 88, 320)}px` }}>
                  {visiblePoints.map((point) => (
                    <div key={point.key} className="flex-1 min-w-[4.5rem] flex flex-col items-center gap-3">
                      <div className="h-48 w-full flex items-end justify-center gap-2">
                        {point.values.map((item) => {
                          const height = item.value <= 0 ? 8 : Math.max((item.value / maxBarValue) * 100, 8);
                          return (
                            <div key={item.key} className="flex-1 h-full flex flex-col items-center gap-2">
                              <span className={`text-[10px] tabular-nums ${mutedClass}`}>{item.rawValue ?? 0}</span>
                              <div className="flex-1 w-full flex items-end">
                                <div
                                  className="w-full min-w-[12px] rounded-t-md shadow-sm"
                                  style={{ height: `${height}%`, backgroundColor: item.color }}
                                  title={`${item.name}: ${item.rawValue ?? 0}`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <span className={`text-[11px] font-medium text-center leading-tight ${mutedClass}`}>{point.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {hasHighlights && (
            <div>
              <h3 className={`text-sm font-medium mb-3 ${isAgent ? "text-[color:var(--agent-text)]" : "text-slate-200"}`}>
                {summaryTitle || "Highlights"}
              </h3>
              <div className="space-y-3">
                {highlights.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className={`text-sm w-28 shrink-0 truncate ${mutedClass}`}>{item.label}</span>
                    <div className={`flex-1 h-2.5 rounded-full overflow-hidden ${isAgent ? "bg-white/10" : "bg-slate-600"}`}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max((item.value / maxBarValue) * 100, item.value > 0 ? 4 : 0)}%`,
                          backgroundColor: item.color,
                        }}
                        title={`${item.label}: ${item.value}`}
                      />
                    </div>
                    <span className={`text-sm tabular-nums w-12 text-right ${titleClass}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hiddenPoints.length > 0 && (
            <p className={`text-xs mt-4 ${subtleClass}`}>Hidden points: {hiddenPoints.join(", ")}</p>
          )}

          {!hasChart && !hasHighlights && (
            <p className={`text-sm border border-dashed rounded-lg px-4 py-6 text-center ${isAgent ? "text-[color:var(--agent-muted)] border-[color:var(--agent-border)]" : "text-slate-500 border-white/15"}`}>
              Add data series or summary rows in the portfolio editor.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
