const COMMON_COLUMN_ORDER = [
  "label",
  "name",
  "title",
  "value",
  "amount",
  "status",
  "category",
  "percentage",
  "link",
  "url",
];

function humanizeKey(key) {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase());
}

function isImageUrl(value) {
  return typeof value === "string" && /^https?:\/\/.+\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(value);
}

function asLinkHref(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return `mailto:${trimmed}`;
  if (/^\+?[\d\s\-()]+$/.test(trimmed)) return `tel:${trimmed.replace(/[^\d+]/g, "")}`;
  return null;
}

function inferColumnType(key, sampleValue, explicitType) {
  if (explicitType) return explicitType;

  const normalizedKey = String(key).toLowerCase();
  if (normalizedKey.includes("image") || normalizedKey.includes("logo") || normalizedKey.includes("avatar") || isImageUrl(sampleValue)) {
    return "image";
  }
  if (normalizedKey.includes("link") || normalizedKey.includes("url") || normalizedKey.includes("website") || asLinkHref(sampleValue)) {
    return "link";
  }
  if (normalizedKey.includes("status") || normalizedKey.includes("category") || normalizedKey.includes("tag") || normalizedKey.includes("type")) {
    return "badge";
  }
  if (normalizedKey.includes("percent") || normalizedKey.includes("progress") || normalizedKey.includes("rate")) {
    return "percentage";
  }
  return "text";
}

function normalizeColumns(rows, columnDefinitions = [], columnOrder = [], hiddenColumns = []) {
  const rowKeys = new Set();
  rows.forEach((row) => {
    if (row && typeof row === "object") {
      Object.keys(row).forEach((key) => rowKeys.add(key));
    }
  });

  const definedColumns = Array.isArray(columnDefinitions) ? columnDefinitions : [];
  const normalizedDefs = definedColumns
    .map((column) => {
      if (typeof column === "string") {
        return { key: column, label: humanizeKey(column) };
      }
      if (column && typeof column === "object" && column.key) {
        return {
          key: column.key,
          label: column.label || humanizeKey(column.key),
          type: column.type,
        };
      }
      return null;
    })
    .filter(Boolean);

  normalizedDefs.forEach((column) => rowKeys.add(column.key));

  const preferredKeys = Array.isArray(columnOrder) && columnOrder.length > 0 ? columnOrder : COMMON_COLUMN_ORDER;
  const hidden = new Set(Array.isArray(hiddenColumns) ? hiddenColumns : []);
  const orderedKeys = [
    ...preferredKeys.filter((key) => rowKeys.has(key)),
    ...normalizedDefs.map((column) => column.key).filter((key) => rowKeys.has(key)),
    ...[...rowKeys].filter((key) => !preferredKeys.includes(key)),
  ].filter((key, index, array) => !hidden.has(key) && array.indexOf(key) === index);

  return orderedKeys.map((key) => {
    const explicit = normalizedDefs.find((column) => column.key === key);
    const sampleValue = rows.find((row) => row && row[key] != null && row[key] !== "")?.[key];
    return {
      key,
      label: explicit?.label || humanizeKey(key),
      type: inferColumnType(key, sampleValue, explicit?.type),
    };
  });
}

function renderCellValue(column, row, titleClass, mutedClass) {
  const value = row?.[column.key];

  if (value == null || value === "") {
    return <span className={mutedClass}>—</span>;
  }

  if (column.type === "image" && typeof value === "string") {
    return <img src={value} alt={column.label} className="h-10 w-10 rounded-lg object-cover border border-white/10" />;
  }

  if (column.type === "link") {
    const href = asLinkHref(String(value));
    const label = row?.buttonText || String(value);
    return href ? (
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="text-sky-400 underline underline-offset-2 break-all">
        {label}
      </a>
    ) : (
      <span className="break-all">{String(value)}</span>
    );
  }

  if (column.type === "percentage") {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      const width = Math.max(0, Math.min(100, numeric));
      return (
        <div className="min-w-[9rem] space-y-1">
          <div className={`text-sm font-medium ${titleClass}`}>{numeric}%</div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-cyan-400" style={{ width: `${width}%` }} />
          </div>
        </div>
      );
    }
  }

  if (column.type === "badge") {
    return (
      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${titleClass} bg-white/10`}>
        {String(value)}
      </span>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-2">
        {value.map((item, index) => (
          <span key={`${column.key}-${index}`} className={`inline-flex rounded-full px-2.5 py-1 text-xs ${titleClass} bg-white/10`}>
            {String(item)}
          </span>
        ))}
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${value ? titleClass : mutedClass} bg-white/10`}>
        {value ? "Yes" : "No"}
      </span>
    );
  }

  if (typeof value === "object") {
    return (
      <div className="space-y-1">
        {Object.entries(value).map(([nestedKey, nestedValue]) => (
          <div key={nestedKey} className="text-sm break-words">
            <span className={mutedClass}>{humanizeKey(nestedKey)}:</span> {String(nestedValue)}
          </div>
        ))}
      </div>
    );
  }

  return <span className="break-words whitespace-pre-wrap">{String(value)}</span>;
}

export default function TableBlock({
  template,
  tableTitle,
  sectionTitle,
  sectionIntro,
  tableData,
  columns: columnDefinitions,
  columnOrder = [],
  hiddenColumns = [],
  displayMode = "table",
  emptyStateText,
  isActive,
  createdAt,
  updatedAt,
}) {
  const rows = Array.isArray(tableData) ? tableData : [];
  const columns = normalizeColumns(rows, columnDefinitions, columnOrder, hiddenColumns);

  const isDS = template === "dataScientist";
  const isAgent = template === "agent";
  const shell =
    "rounded-xl border overflow-hidden shadow-lg " +
    (isDS
      ? "border-[color:var(--ds-border)] bg-[color:var(--ds-surface)]/80"
      : isAgent
        ? "border-[color:var(--agent-border)] bg-[color:var(--agent-panel)]"
        : "border-white/10 bg-slate-700/50");
  const titleClass = isAgent ? "text-[color:var(--agent-text)]" : "text-white";
  const mutedClass = isAgent ? "text-[color:var(--agent-muted)]" : "text-slate-400";
  const rowBorderClass = isAgent ? "border-[color:var(--agent-border)]" : "border-white/10";
  const renderAsCards = displayMode === "cards";

  return (
    <section className={isDS ? "py-10 bg-transparent" : isAgent ? "py-12" : "py-12 bg-slate-800"}>
      <div className="max-w-5xl mx-auto px-4">
        <div className={shell}>
          <div className={`px-4 py-3 flex items-start justify-between gap-3 ${isAgent ? "border-b border-[color:var(--agent-border)]" : "border-b border-white/10"}`}>
            <div className="space-y-1">
              <h2 className={`text-xl font-semibold ${titleClass}`}>{sectionTitle || tableTitle || "Data Table"}</h2>
              {sectionIntro && <p className={`text-sm max-w-3xl ${mutedClass}`}>{sectionIntro}</p>}
            </div>
            {isActive === false && <span className={`text-xs uppercase tracking-wide ${mutedClass}`}>Inactive</span>}
          </div>

          {rows.length === 0 ? (
            <p className={`text-sm px-4 py-8 text-center border border-dashed m-4 rounded-lg ${isAgent ? "text-[color:var(--agent-muted)] border-[color:var(--agent-border)]" : "text-slate-500 border-white/20"}`}>
              {emptyStateText || "Add rows in the portfolio editor."}
            </p>
          ) : renderAsCards ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {rows.map((row, rowIndex) => (
                <div key={rowIndex} className={`rounded-xl border ${rowBorderClass} p-4 space-y-3 bg-white/5`}>
                  {columns.map((column) => (
                    <div key={column.key} className="space-y-1">
                      <div className={`text-[11px] uppercase tracking-wide ${mutedClass}`}>{column.label}</div>
                      <div className={`text-sm ${titleClass}`}>{renderCellValue(column, row, titleClass, mutedClass)}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`w-full text-sm text-left ${isAgent ? "text-[color:var(--agent-text)]" : "text-slate-300"}`}>
                <thead className={`text-xs uppercase ${isAgent ? "text-[color:var(--agent-muted)] bg-white/5" : "text-slate-400 bg-slate-900/50"}`}>
                  <tr>
                    {columns.map((column) => (
                      <th key={column.key} className="px-4 py-3 font-medium whitespace-nowrap">
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
                    <tr key={ri} className={isAgent ? "border-t border-[color:var(--agent-border)] hover:bg-white/5" : "border-t border-white/10 hover:bg-white/5"}>
                      {columns.map((column) => (
                        <td key={column.key} className="px-4 py-3 align-top max-w-[18rem]">
                          {renderCellValue(column, row, titleClass, mutedClass)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(createdAt || updatedAt) && (
            <div className={`px-4 py-2 text-xs ${isAgent ? "text-[color:var(--agent-muted)] border-t border-[color:var(--agent-border)]" : "text-slate-500 border-t border-white/10"}`}>
              {createdAt && <span className="mr-4">Created: {String(createdAt)}</span>}
              {updatedAt && <span>Updated: {String(updatedAt)}</span>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
