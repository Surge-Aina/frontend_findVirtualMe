import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  FieldEditor,
  JsonCodeSurface,
  JsonEditor,
  JsonPreview,
  editorLabelClass,
  editorSelectClass,
  editorBtnSmClass,
  editorBtnSmDangerClass,
  editorOutlineBtnClass,
  editorMutedClass,
  editorCardShellClass,
  editorDetailsClass,
} from "./PortfolioEditorFields";

/** Comma, space, or newline separated numbers */
function parseNumberList(s) {
  if (s == null || String(s).trim() === "") return [];
  return String(s)
    .split(/[\s,]+/)
    .map((x) => x.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => !Number.isNaN(n));
}

function numbersToTextareaText(arr) {
  if (!Array.isArray(arr)) return "";
  return arr.join("\n");
}

/** Comma or newline separated labels */
function parseLabelList(s) {
  if (s == null || String(s).trim() === "") return [];
  return String(s)
    .split(/[\n,]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function labelsToTextareaText(arr) {
  if (!Array.isArray(arr)) return "";
  return arr.join("\n");
}

/**
 * Keeps raw textarea text while focused so Enter/newlines and commas are not lost on every
 * keystroke (parse+re-render would strip trailing empty lines).
 */
function useSyncedListText(currentArray, format, parse, onCommit) {
  const parentKey = JSON.stringify(Array.isArray(currentArray) ? currentArray : []);
  const parentFormatted = useMemo(() => format(JSON.parse(parentKey)), [parentKey, format]);

  const [text, setText] = useState(parentFormatted);
  const [focused, setFocused] = useState(false);

  useLayoutEffect(() => {
    if (!focused) setText(parentFormatted);
  }, [parentFormatted, focused]);

  return {
    text,
    setText,
    onFocus: () => setFocused(true),
    onBlur: () => {
      setFocused(false);
      onCommit(parse(text));
    },
  };
}

function parseHiddenPoints(s) {
  if (s == null || String(s).trim() === "") return [];
  return String(s)
    .split(/[\s,]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function rowHasContent(row) {
  if (!row || typeof row !== "object") return false;
  return Object.values(row).some((v) => v !== "" && v != null);
}

function detectDelimiter(line) {
  const tabs = (line.match(/\t/g) || []).length;
  const commas = (line.match(/,/g) || []).length;
  if (tabs > 0 && tabs >= commas) return "\t";
  if (commas > 0) return ",";
  return "\t";
}

function splitDelimitedLine(line, delim) {
  if (delim === "\t") return line.split("\t").map((s) => s.trim());
  const result = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && c === ",") {
      result.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  result.push(cur.trim());
  return result;
}

function sanitizeHeaderKey(s) {
  const t = String(s).trim();
  return t || "column";
}

function coerceCell(s) {
  if (s === "") return "";
  const t = s.trim();
  if (t === "true") return true;
  if (t === "false") return false;
  if ((t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"))) {
    try {
      return JSON.parse(t);
    } catch {
      /* keep string */
    }
  }
  const n = Number(t);
  if (!Number.isNaN(n) && /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(t)) return n;
  return s;
}

function parseSpreadsheetText(text, firstRowHeaders) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const delim = detectDelimiter(lines[0]);
  const split = (line) => splitDelimitedLine(line, delim);

  if (firstRowHeaders) {
    const keys = split(lines[0]).map(sanitizeHeaderKey);
    const out = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = split(lines[i]);
      const obj = {};
      keys.forEach((k, j) => {
        const cell = cells[j];
        if (cell !== undefined && cell !== "") obj[k] = coerceCell(cell);
      });
      if (Object.keys(obj).length) out.push(obj);
    }
    return out;
  }

  const n = split(lines[0]).length;
  const keys = Array.from({ length: n }, (_, i) => `Column ${i + 1}`);
  const out = [];
  for (const line of lines) {
    const cells = split(line);
    const obj = {};
    keys.forEach((k, j) => {
      const cell = cells[j];
      if (cell !== undefined && cell !== "") obj[k] = coerceCell(cell);
    });
    if (Object.keys(obj).length) out.push(obj);
  }
  return out;
}

function inferColumnKeys(rows, columnOrder) {
  const ordered = Array.isArray(columnOrder) ? columnOrder.filter(Boolean) : [];
  const allKeys = new Set();
  for (const row of rows) {
    if (row && typeof row === "object") {
      for (const k of Object.keys(row)) allKeys.add(k);
    }
  }
  const keys = [];
  for (const k of ordered) {
    if (allKeys.has(k)) {
      keys.push(k);
      allKeys.delete(k);
    }
  }
  for (const k of allKeys) keys.push(k);
  return keys;
}

function cellToSpreadsheetValue(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function rowsToSpreadsheetText(rows, columnOrder) {
  if (!Array.isArray(rows) || rows.length === 0) return "";
  const keys = inferColumnKeys(rows, columnOrder);
  const esc = (v) => {
    const s = cellToSpreadsheetValue(v);
    if (/[\t\n"]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [keys.map(esc).join("\t")];
  for (const row of rows) {
    lines.push(keys.map((k) => esc(row[k])).join("\t"));
  }
  return lines.join("\n");
}

function TableSpreadsheetEditor({ rows, columnOrder, onCommit }) {
  const stableRows = Array.isArray(rows) ? rows : [];
  const parentKey = JSON.stringify(stableRows);
  const orderKey = JSON.stringify(Array.isArray(columnOrder) ? columnOrder : []);
  const parentFormatted = useMemo(
    () => rowsToSpreadsheetText(JSON.parse(parentKey), JSON.parse(orderKey)),
    [parentKey, orderKey]
  );

  const [text, setText] = useState(parentFormatted);
  const [focused, setFocused] = useState(false);
  const [firstRowHeaders, setFirstRowHeaders] = useState(true);
  const [parseError, setParseError] = useState(null);

  useLayoutEffect(() => {
    if (!focused) setText(parentFormatted);
  }, [parentFormatted, focused]);

  const apply = () => {
    setParseError(null);
    try {
      const trimmed = text.trim();
      if (trimmed === "") {
        onCommit([]);
        return;
      }
      const parsed = parseSpreadsheetText(text, firstRowHeaders);
      onCommit(parsed.filter(rowHasContent));
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Could not parse table");
    }
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-neutral-300 cursor-pointer select-none">
        <input
          type="checkbox"
          className="rounded border-gray-300 dark:border-neutral-600 dark:bg-neutral-800"
          checked={firstRowHeaders}
          onChange={(e) => setFirstRowHeaders(e.target.checked)}
        />
        First row is column names
      </label>
      <textarea
        rows={14}
        spellCheck={false}
        className={`w-full px-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          apply();
        }}
        placeholder={"name\tstatus\tvalue\nProject A\tActive\t100\nProject B\tDraft\t50"}
      />
      {parseError && <p className="text-xs text-red-600">{parseError}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            apply();
          }}
          className={editorOutlineBtnClass}
        >
          Apply table data
        </button>
        <span className="text-xs text-gray-500 dark:text-neutral-500">Tab or comma-separated; blur also saves.</span>
      </div>
    </div>
  );
}

function TableDataJsonArrayEditor({ rows, onCommit }) {
  const stableRows = Array.isArray(rows) ? rows : [];
  const parentKey = JSON.stringify(stableRows);
  const parentFormatted = useMemo(() => JSON.stringify(JSON.parse(parentKey), null, 2), [parentKey]);

  const [text, setText] = useState(parentFormatted);
  const textRef = useRef(parentFormatted);
  const [error, setError] = useState(null);

  useEffect(() => {
    setText(parentFormatted);
    textRef.current = parentFormatted;
    setError(null);
  }, [parentFormatted]);

  const apply = () => {
    try {
      const parsed = JSON.parse(textRef.current);
      if (!Array.isArray(parsed)) {
        setError("Must be a JSON array of row objects.");
        return;
      }
      const filtered = parsed.filter(
        (item) =>
          item &&
          typeof item === "object" &&
          !Array.isArray(item) &&
          rowHasContent(item)
      );
      onCommit(filtered);
      setError(null);
    } catch {
      setError("Invalid JSON.");
    }
  };

  return (
    <div className="space-y-2 mt-2">
      <p className="text-xs text-gray-500 dark:text-neutral-400">
        Use this when you need nested fields or full control. Must be an array of objects (same shape as{" "}
        <code className="text-[11px] bg-gray-100 dark:bg-neutral-700 dark:text-neutral-200 px-1 rounded">tableData</code> in the reference below).
      </p>
      <JsonCodeSurface
        value={text}
        height={320}
        onChange={(nextValue) => {
          const v = nextValue ?? "";
          textRef.current = v;
          setText(v);
        }}
        onBlur={apply}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="button"
        onClick={apply}
        className={editorOutlineBtnClass}
      >
        Apply JSON array
      </button>
    </div>
  );
}

const CHART_JSON_EXAMPLE = `{
  "sectionTitle": "Performance overview",
  "sectionIntro": "Compare multiple metrics side by side and add an optional summary breakdown.",
  "xAxisLabel": "Month",
  "yAxisLabel": "Count / $",
  "data": {
    "xLabels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "hiddenPoints": [],
    "series": [
      { "name": "Leads", "color": "#10b981", "values": [120, 190, 300, 500, 200, 300] },
      { "name": "Revenue", "color": "#06b6d4", "values": [15, 22, 35, 48, 25, 32] }
    ]
  },
  "summaryTitle": "Workflow split",
  "summaryItems": [
    { "label": "Build", "value": 40, "color": "#10b981" },
    { "label": "Analyze", "value": 35, "color": "#8b5cf6" },
    { "label": "Report", "value": 25, "color": "#f59e0b" }
  ],
  "isActive": true
}`;

const TABLE_JSON_EXAMPLE = `{
  "sectionTitle": "Data table",
  "sectionIntro": "Use a flexible table or card layout for metrics, directories, comparisons, inventories, or other structured data.",
  "displayMode": "table",
  "columnOrder": ["service", "status", "owner", "website", "completion"],
  "columns": [
    { "key": "service", "label": "Service" },
    { "key": "status", "label": "Status", "type": "badge" },
    { "key": "website", "label": "Website", "type": "link" },
    { "key": "completion", "label": "Completion", "type": "percentage" }
  ],
  "tableData": [
    { "service": "Analytics Dashboard", "status": "Active", "owner": "Casey", "website": "https://example.com", "completion": 92 },
    { "service": "Forecasting API", "status": "Draft", "owner": "Jordan", "website": "https://example.com/api", "completion": 61 }
  ],
  "emptyStateText": "Add rows to display your data."
}`;

const CHART_SERIES_COLORS = ["#10b981", "#06b6d4", "#8b5cf6", "#f59e0b", "#ef4444"];

function emptyChartSeries(index) {
  return {
    name: `Series ${index + 1}`,
    color: CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length],
    values: [],
  };
}

function normalizeChartSeries(base) {
  const data = base?.data && typeof base.data === "object" ? base.data : {};
  const provided = Array.isArray(data.series) ? data.series : [];

  if (provided.length > 0) {
    return provided.map((item, index) => ({
      name: item?.name || item?.label || `Series ${index + 1}`,
      color: item?.color || CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length],
      values: Array.isArray(item?.values) ? item.values : Array.isArray(item?.data) ? item.data : [],
    }));
  }

  const fallback = [
    {
      name: "Sales",
      color: CHART_SERIES_COLORS[0],
      values: Array.isArray(data.sales) ? data.sales : [],
    },
    {
      name: "Revenue",
      color: CHART_SERIES_COLORS[1],
      values: Array.isArray(data.revenue) ? data.revenue : [],
    },
  ].filter((item) => item.values.length > 0);

  return fallback.length > 0 ? fallback : [emptyChartSeries(0), emptyChartSeries(1)];
}

function ChartSeriesValuesField({ values, onCommit }) {
  const ctl = useSyncedListText(values, numbersToTextareaText, parseNumberList, onCommit);
  return (
    <FieldEditor
      label="Values (comma, space, or newline separated)"
      value={ctl.text}
      onChange={ctl.setText}
      onFocus={ctl.onFocus}
      onBlur={ctl.onBlur}
      type="textarea"
      rows={4}
      placeholder={"10\n20\n15"}
    />
  );
}

function ChartXLabelsField({ xLabels, onCommit }) {
  const ctl = useSyncedListText(xLabels, labelsToTextareaText, parseLabelList, onCommit);
  return (
    <FieldEditor
      label="X labels (optional; defaults to Item 1, Item 2, …)"
      value={ctl.text}
      onChange={ctl.setText}
      onFocus={ctl.onFocus}
      onBlur={ctl.onBlur}
      type="textarea"
      rows={3}
      placeholder={"Jan\nFeb\nMar"}
    />
  );
}

function normalizeSummaryItems(base) {
  if (Array.isArray(base.summaryItems) && base.summaryItems.length > 0) {
    return base.summaryItems.map((item, index) => ({
      label: item?.label || item?.name || `Item ${index + 1}`,
      value: item?.value ?? "",
      color: item?.color || CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length],
    }));
  }

  const categories = Array.isArray(base.categories) ? base.categories : [];
  const values = Array.isArray(base.categoryData) ? base.categoryData : [];
  const fallback = categories.map((label, index) => ({
    label,
    value: values[index] ?? "",
    color: CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length],
  }));

  return fallback.length > 0 ? fallback : [{ label: "Item 1", value: "", color: CHART_SERIES_COLORS[0] }];
}

/**
 * Data visualization block: `data.series` holds named/colorized chart series.
 * Legacy `sales` / `revenue` data is still supported and auto-mapped into the new editor.
 */
export function DashboardChartEditor({ data, onChange }) {
  const base = data != null && typeof data === "object" ? data : {};
  const set = (key, val) => onChange({ ...base, [key]: val });
  const series = base.data && typeof base.data === "object" ? base.data : {};
  const setSeries = (key, val) =>
    onChange({
      ...base,
      data: { ...series, [key]: val },
    });
  const chartSeries = normalizeChartSeries(base);
  const summaryItems = normalizeSummaryItems(base);
  const sectionTitle = base.sectionTitle ?? base.chartTitle ?? "";

  const setChartSeries = (nextSeries) => {
    const cleaned = nextSeries
      .map((item, index) => ({
        name: item?.name || `Series ${index + 1}`,
        color: item?.color || CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length],
        values: Array.isArray(item?.values) ? item.values : [],
      }))
      .filter((item) => item.name || item.values.length > 0);

    onChange({
      ...base,
      data: {
        ...series,
        series: cleaned,
        sales: cleaned[0]?.values || [],
        revenue: cleaned[1]?.values || [],
      },
    });
  };

  const updateChartSeries = (index, patch) => {
    const next = chartSeries.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
    setChartSeries(next);
  };

  const addChartSeries = () => setChartSeries([...chartSeries, emptyChartSeries(chartSeries.length)]);

  const removeChartSeries = (index) => {
    const next = chartSeries.filter((_, itemIndex) => itemIndex !== index);
    setChartSeries(next.length > 0 ? next : [emptyChartSeries(0)]);
  };

  const setSummaryItems = (nextItems) => {
    const cleaned = nextItems
      .map((item, index) => ({
        label: item?.label || `Item ${index + 1}`,
        value: item?.value,
        color: item?.color || CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length],
      }))
      .filter((item) => item.label || item.value !== "");

    onChange({
      ...base,
      summaryItems: cleaned,
      categories: cleaned.map((item) => item.label),
      categoryData: cleaned.map((item) => Number(item.value) || 0),
    });
  };

  const updateSummaryItem = (index, patch) => {
    const next = summaryItems.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
    setSummaryItems(next);
  };

  const addSummaryItem = () =>
    setSummaryItems([
      ...summaryItems,
      {
        label: `Item ${summaryItems.length + 1}`,
        value: "",
        color: CHART_SERIES_COLORS[summaryItems.length % CHART_SERIES_COLORS.length],
      },
    ]);

  const removeSummaryItem = (index) => {
    const next = summaryItems.filter((_, itemIndex) => itemIndex !== index);
    setSummaryItems(next.length > 0 ? next : [{ label: "Item 1", value: "", color: CHART_SERIES_COLORS[0] }]);
  };

  return (
    <div className="space-y-6">
      <p className={`${editorMutedClass} leading-relaxed`}>
        Build a flexible data visualization with as many bar series as you want, plus an optional horizontal summary.
        Numbers can be separated by commas, spaces, or new lines. For full control, use <strong>Edit as JSON</strong> at
        the bottom.
      </p>

      <div className="space-y-4">
        <FieldEditor
          label="Section title"
          value={sectionTitle}
          onChange={(v) => onChange({ ...base, sectionTitle: v, chartTitle: v })}
        />
        <FieldEditor label="Section intro" value={base.sectionIntro} onChange={(v) => set("sectionIntro", v)} type="textarea" rows={2} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldEditor label="X axis label" value={base.xAxisLabel} onChange={(v) => set("xAxisLabel", v)} />
          <FieldEditor label="Y axis label" value={base.yAxisLabel} onChange={(v) => set("yAxisLabel", v)} />
        </div>
        <FieldEditor label="Summary title" value={base.summaryTitle} onChange={(v) => set("summaryTitle", v)} />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={base.isActive !== false}
            onChange={(e) => set("isActive", e.target.checked)}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">Section active</span>
        </label>
      </div>

      <div className="border-t border-gray-200 dark:border-neutral-600 pt-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-neutral-200">Bar series</h3>
          <button type="button" onClick={addChartSeries} className={editorBtnSmClass}>
            Add series
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-neutral-400">
          Each series gets its own label, color, and value list. Matching positions render as grouped bars.
        </p>
        {chartSeries.map((item, index) => (
          <div key={`${item.name}-${index}`} className={editorCardShellClass}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-800 dark:text-neutral-200">Series {index + 1}</p>
              <button type="button" onClick={() => removeChartSeries(index)} className={editorBtnSmDangerClass}>
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
              <FieldEditor
                label="Series label"
                value={item.name}
                onChange={(v) => updateChartSeries(index, { name: v })}
                placeholder={`Series ${index + 1}`}
              />
              <FieldEditor
                label="Color"
                type="color"
                value={item.color}
                onChange={(v) => updateChartSeries(index, { color: v })}
              />
            </div>
            <ChartSeriesValuesField
              values={item.values}
              onCommit={(vals) => updateChartSeries(index, { values: vals })}
            />
          </div>
        ))}
        <ChartXLabelsField xLabels={series.xLabels} onCommit={(arr) => setSeries("xLabels", arr)} />
        <FieldEditor
          label="Hidden points (labels or indices to hide — optional)"
          value={Array.isArray(series.hiddenPoints) ? series.hiddenPoints.join(", ") : ""}
          onChange={(v) => setSeries("hiddenPoints", parseHiddenPoints(v))}
          placeholder="optional"
        />
      </div>

      <div className="border-t border-gray-200 dark:border-neutral-600 pt-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-neutral-200">Summary rows (optional)</h3>
          <button type="button" onClick={addSummaryItem} className={editorBtnSmClass}>
            Add row
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-neutral-400">
          Use these for a horizontal breakdown below the chart, like workflow split, channel mix, or key segments.
        </p>
        {summaryItems.map((item, index) => (
          <div key={`${item.label}-${index}`} className="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto_auto] gap-4 items-end">
            <FieldEditor
              label="Label"
              value={item.label}
              onChange={(v) => updateSummaryItem(index, { label: v })}
              placeholder={`Item ${index + 1}`}
            />
            <FieldEditor
              label="Value"
              value={item.value}
              onChange={(v) => updateSummaryItem(index, { value: v })}
              placeholder="40"
            />
            <FieldEditor
              label="Color"
              type="color"
              value={item.color}
              onChange={(v) => updateSummaryItem(index, { color: v })}
            />
            <button type="button" onClick={() => removeSummaryItem(index)} className={editorBtnSmDangerClass}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <details className={editorDetailsClass}>
        <summary className="text-left text-sm font-medium text-gray-800 dark:text-neutral-200 cursor-pointer">
          Expected JSON shape (reference)
        </summary>
        <p className="mt-2 text-xs text-gray-500 dark:text-neutral-400">
          Use this as a formatting reference. You can include only the fields you need.
        </p>
        <div className="mt-3">
          <JsonPreview value={CHART_JSON_EXAMPLE} height={280} />
        </div>
      </details>

      <details className={editorDetailsClass}>
        <summary className="text-sm font-medium text-gray-800 dark:text-neutral-200 cursor-pointer">Edit as JSON (advanced)</summary>
        <p className="text-xs text-gray-500 dark:text-neutral-400 mt-2 mb-2">
          Paste or edit the full section object. Blur the field to apply.
        </p>
        <JsonEditor data={base} onChange={onChange} />
      </details>
    </div>
  );
}

/**
 * Table block: `tableData` is an array of row objects; any keys become columns (common: name, value, percentage, icon, link, buttonText).
 */
export function DashboardTableEditor({ data, onChange }) {
  const base = data != null && typeof data === "object" ? data : {};
  const set = (key, val) => onChange({ ...base, [key]: val });
  const rows = Array.isArray(base.tableData) ? base.tableData : [];
  const sectionTitle = base.sectionTitle ?? base.tableTitle ?? "";

  const columnOrderCtl = useSyncedListText(base.columnOrder, labelsToTextareaText, parseLabelList, (arr) =>
    set("columnOrder", arr)
  );
  const hiddenColumnsCtl = useSyncedListText(base.hiddenColumns, labelsToTextareaText, parseLabelList, (arr) =>
    set("hiddenColumns", arr)
  );

  return (
    <div className="space-y-6">
      <p className={`${editorMutedClass} leading-relaxed`}>
        Paste or type your table below (spreadsheet-style). Use the first row as column names, or switch to JSON in
        Advanced when you need nested data. Empty rows are dropped when you apply.
      </p>

      <div className="space-y-4">
        <FieldEditor
          label="Section title"
          value={sectionTitle}
          onChange={(v) => onChange({ ...base, sectionTitle: v, tableTitle: v })}
        />
        <FieldEditor
          label="Section intro"
          value={base.sectionIntro}
          onChange={(v) => set("sectionIntro", v)}
          type="textarea"
          rows={2}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={editorLabelClass}>Display mode</label>
            <select
              className={editorSelectClass}
              value={base.displayMode || "table"}
              onChange={(e) => set("displayMode", e.target.value)}
            >
              <option value="table">Table</option>
              <option value="cards">Cards</option>
            </select>
          </div>
          <FieldEditor
            label="Empty state text"
            value={base.emptyStateText}
            onChange={(v) => set("emptyStateText", v)}
            placeholder="Shown when there are no rows"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldEditor
            label="Column order (one key per line)"
            value={columnOrderCtl.text}
            onChange={columnOrderCtl.setText}
            onFocus={columnOrderCtl.onFocus}
            onBlur={columnOrderCtl.onBlur}
            type="textarea"
            rows={3}
            placeholder={"label\nvalue\nstatus"}
          />
          <FieldEditor
            label="Hidden columns (one key per line)"
            value={hiddenColumnsCtl.text}
            onChange={hiddenColumnsCtl.setText}
            onFocus={hiddenColumnsCtl.onFocus}
            onBlur={hiddenColumnsCtl.onBlur}
            type="textarea"
            rows={3}
            placeholder={"internalId\nbuttonText"}
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-800/80 p-4 space-y-3 shadow-sm">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-neutral-200">Table data</h3>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
            Paste from Excel or Google Sheets (tabs), or use commas. One row per line. Clear the box and apply to remove
            all rows.
          </p>
        </div>
        <TableSpreadsheetEditor
          rows={rows}
          columnOrder={base.columnOrder}
          onCommit={(nextRows) => set("tableData", nextRows)}
        />
      </div>

      <details className={editorDetailsClass}>
        <summary className="text-left text-sm font-medium text-gray-800 dark:text-neutral-200 cursor-pointer">
          Advanced: table data as JSON array
        </summary>
        <TableDataJsonArrayEditor rows={rows} onCommit={(nextRows) => set("tableData", nextRows)} />
      </details>

      <details className={editorDetailsClass}>
        <summary className="text-left text-sm font-medium text-gray-800 dark:text-neutral-200 cursor-pointer">
          Expected full section JSON (reference)
        </summary>
        <p className="mt-2 text-xs text-gray-500 dark:text-neutral-400">
          Use this as a formatting reference. You can include only the fields you need.
        </p>
        <div className="mt-3">
          <JsonPreview value={TABLE_JSON_EXAMPLE} height={280} />
        </div>
      </details>
    </div>
  );
}
