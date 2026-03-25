import { FieldEditor, JsonEditor } from "./PortfolioEditorFields";

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

function numbersToListText(arr) {
  if (!Array.isArray(arr)) return "";
  return arr.join(", ");
}

/** Comma or newline separated labels */
function parseLabelList(s) {
  if (s == null || String(s).trim() === "") return [];
  return String(s)
    .split(/[\n,]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function labelsToText(arr) {
  if (!Array.isArray(arr)) return "";
  return arr.join(", ");
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

const CHART_JSON_EXAMPLE = `{
  "chartTitle": "Quarterly metrics",
  "xAxisLabel": "Month",
  "yAxisLabel": "Count / $",
  "data": {
    "sales": [120, 190, 300, 500, 200, 300],
    "revenue": [15000, 22000, 35000, 48000, 25000, 32000],
    "xLabels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "hiddenPoints": []
  },
  "categories": ["Build", "Analyze", "Report"],
  "categoryData": [40, 35, 25],
  "isActive": true
}`;

const TABLE_JSON_EXAMPLE = `{
  "tableTitle": "Skills snapshot",
  "tableData": [
    { "name": "Python", "value": 95, "percentage": 40, "icon": "🐍", "link": "", "buttonText": "" },
    { "name": "SQL", "value": 88, "percentage": 35, "icon": "📊", "link": "", "buttonText": "" }
  ]
}`;

/**
 * Chart block: `data` holds series (sales, revenue, xLabels, hiddenPoints).
 * Bar charts use sales/revenue + xLabels; the "Categories" strip uses categories + categoryData (same length).
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

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600 leading-relaxed">
        Use the fields below for bar series and optional category bars. Numbers can be separated by commas, spaces, or
        new lines. For full control, use <strong>Edit as JSON</strong> at the bottom.
      </p>

      <div className="space-y-4">
        <FieldEditor label="Chart title" value={base.chartTitle} onChange={(v) => set("chartTitle", v)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldEditor label="X axis label" value={base.xAxisLabel} onChange={(v) => set("xAxisLabel", v)} />
          <FieldEditor label="Y axis label" value={base.yAxisLabel} onChange={(v) => set("yAxisLabel", v)} />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={base.isActive !== false}
            onChange={(e) => set("isActive", e.target.checked)}
          />
          <span className="text-sm font-medium text-gray-700">Section active</span>
        </label>
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-800">Bar series</h3>
        <FieldEditor
          label="Sales — numbers (comma, space, or newline)"
          value={numbersToListText(series.sales)}
          onChange={(v) => setSeries("sales", parseNumberList(v))}
          type="textarea"
          rows={2}
          placeholder="e.g. 10, 20, 15 or one number per line"
        />
        <FieldEditor
          label="Revenue — numbers (same count as sales for aligned bars)"
          value={numbersToListText(series.revenue)}
          onChange={(v) => setSeries("revenue", parseNumberList(v))}
          type="textarea"
          rows={2}
        />
        <FieldEditor
          label="X labels — one per comma or line (optional; defaults to 1, 2, 3…)"
          value={labelsToText(series.xLabels)}
          onChange={(v) => setSeries("xLabels", parseLabelList(v))}
          type="textarea"
          rows={2}
          placeholder='Jan, Feb, Mar or "Q1" on each line'
        />
        <FieldEditor
          label="Hidden points (labels or indices to hide — optional)"
          value={Array.isArray(series.hiddenPoints) ? series.hiddenPoints.join(", ") : ""}
          onChange={(v) => setSeries("hiddenPoints", parseHiddenPoints(v))}
          placeholder="optional"
        />
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-800">Category bars (optional)</h3>
        <p className="text-xs text-gray-500">
          One category name per line, then the same number of values in &quot;Category values&quot;.
        </p>
        <FieldEditor
          label="Categories (one per line)"
          value={Array.isArray(base.categories) ? base.categories.join("\n") : ""}
          onChange={(v) => set("categories", v.split(/\r?\n/).map((x) => x.trim()).filter(Boolean))}
          type="textarea"
          rows={4}
          placeholder={"Build\nAnalyze\nReport"}
        />
        <FieldEditor
          label="Category values — numbers (comma or space, same order as lines above)"
          value={numbersToListText(base.categoryData)}
          onChange={(v) => set("categoryData", parseNumberList(v))}
          type="textarea"
          rows={2}
          placeholder="40, 35, 25"
        />
      </div>

      <details className="border border-gray-200 rounded-lg p-4 bg-gray-50/80">
        <summary className="text-sm font-medium text-gray-800 cursor-pointer">Expected JSON shape (reference)</summary>
        <pre className="mt-3 text-xs text-gray-700 overflow-x-auto font-mono bg-white border border-gray-200 rounded p-3 whitespace-pre-wrap">
          {CHART_JSON_EXAMPLE}
        </pre>
      </details>

      <details className="border border-gray-200 rounded-lg p-4 bg-gray-50/80">
        <summary className="text-sm font-medium text-gray-800 cursor-pointer">Edit as JSON (advanced)</summary>
        <p className="text-xs text-gray-500 mt-2 mb-2">Paste or edit the full section object. Blur the field to apply.</p>
        <JsonEditor data={base} onChange={onChange} />
      </details>
    </div>
  );
}

const EMPTY_ROW = { name: "", value: "", percentage: "", icon: "", link: "", buttonText: "" };

/**
 * Table block: `tableData` is an array of row objects; any keys become columns (common: name, value, percentage, icon, link, buttonText).
 */
export function DashboardTableEditor({ data, onChange }) {
  const base = data != null && typeof data === "object" ? data : {};
  const set = (key, val) => onChange({ ...base, [key]: val });
  const rows = Array.isArray(base.tableData) ? base.tableData : [];

  const normalizedRows = rows.length > 0 ? rows : [{ ...EMPTY_ROW }];

  const updateRow = (index, key, val) => {
    const next = normalizedRows.map((r, i) => (i === index ? { ...r, [key]: val } : r));
    const filtered = next.filter(rowHasContent);
    set("tableData", filtered);
  };

  const addRow = () => {
    const current = Array.isArray(base.tableData) ? base.tableData : [];
    set("tableData", [...current, { ...EMPTY_ROW }]);
  };

  const removeRow = (index) => {
    const next = normalizedRows.filter((_, i) => i !== index);
    const filtered = next.filter(rowHasContent);
    set("tableData", filtered);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600 leading-relaxed">
        Add rows below. Each row is a set of columns; you can use any extra keys via <strong>Edit as JSON</strong>. Empty
        rows are not saved.
      </p>

      <FieldEditor label="Table title" value={base.tableTitle} onChange={(v) => set("tableTitle", v)} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Rows</h3>
          <button
            type="button"
            onClick={addRow}
            className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add row
          </button>
        </div>

        {normalizedRows.map((row, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50/80"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Row {index + 1}</span>
              {normalizedRows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Remove row
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FieldEditor
                label="name"
                value={row.name ?? ""}
                onChange={(v) => updateRow(index, "name", v)}
                placeholder="Label"
              />
              <FieldEditor
                label="value"
                value={row.value ?? ""}
                onChange={(v) => updateRow(index, "value", v === "" ? "" : Number(v) || v)}
                placeholder="42"
              />
              <FieldEditor
                label="percentage"
                value={row.percentage ?? ""}
                onChange={(v) => updateRow(index, "percentage", v === "" ? "" : Number(v) || v)}
                placeholder="25"
              />
              <FieldEditor label="icon" value={row.icon ?? ""} onChange={(v) => updateRow(index, "icon", v)} placeholder="emoji" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FieldEditor label="link" value={row.link ?? ""} onChange={(v) => updateRow(index, "link", v)} />
              <FieldEditor
                label="buttonText"
                value={row.buttonText ?? ""}
                onChange={(v) => updateRow(index, "buttonText", v)}
              />
            </div>
          </div>
        ))}
      </div>

      <details className="border border-gray-200 rounded-lg p-4 bg-gray-50/80">
        <summary className="text-sm font-medium text-gray-800 cursor-pointer">Expected JSON shape (reference)</summary>
        <pre className="mt-3 text-xs text-gray-700 overflow-x-auto font-mono bg-white border border-gray-200 rounded p-3 whitespace-pre-wrap">
          {TABLE_JSON_EXAMPLE}
        </pre>
      </details>

      <details className="border border-gray-200 rounded-lg p-4 bg-gray-50/80">
        <summary className="text-sm font-medium text-gray-800 cursor-pointer">Edit as JSON (advanced)</summary>
        <p className="text-xs text-gray-500 mt-2 mb-2">
          Full section object including <code className="text-[11px] bg-gray-100 px-1 rounded">tableData</code> as an array
          of objects. Blur to apply.
        </p>
        <JsonEditor data={base} onChange={onChange} />
      </details>
    </div>
  );
}
