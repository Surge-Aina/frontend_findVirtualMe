/**
 * Dashboard-style table for data scientist template.
 * Expects tableData as an array of row objects (see template defaults).
 */
function pickColumns(rows) {
  if (!rows.length) return [];
  const keys = new Set();
  rows.forEach((row) => {
    if (row && typeof row === "object") {
      Object.keys(row).forEach((k) => keys.add(k));
    }
  });
  const preferred = ["name", "value", "percentage", "icon", "buttonText", "link"];
  const ordered = preferred.filter((k) => keys.has(k));
  const rest = [...keys].filter((k) => !ordered.includes(k));
  return [...ordered, ...rest];
}

export default function TableBlock({
  template,
  tableTitle,
  tableData,
  isActive,
  createdAt,
  updatedAt,
}) {
  const rows = Array.isArray(tableData) ? tableData : [];
  const columns = pickColumns(rows);

  const isDS = template === "dataScientist";
  const isAgent = template === "agent";
  const shell =
    "rounded-xl border overflow-hidden shadow-lg " +
    (isDS
      ? "border-[color:var(--ds-border)] bg-[color:var(--ds-surface)]/80"
      : isAgent
        ? "border-[color:var(--agent-border)] bg-[color:var(--agent-panel)]"
      : "border-white/10 bg-slate-700/50");

  return (
    <section className={isDS ? "py-10 bg-transparent" : isAgent ? "py-12" : "py-12 bg-slate-800"}>
      <div className="max-w-5xl mx-auto px-4">
        <div className={shell}>
          <div className={`px-4 py-3 flex items-center justify-between ${isAgent ? "border-b border-[color:var(--agent-border)]" : "border-b border-white/10"}`}>
            <h2 className={`text-xl font-semibold ${isAgent ? "text-[color:var(--agent-text)]" : "text-white"}`}>{tableTitle || "Table"}</h2>
            {isActive === false && (
              <span className={`text-xs uppercase tracking-wide ${isAgent ? "text-[color:var(--agent-muted)]" : "text-slate-500"}`}>Inactive</span>
            )}
          </div>

          {rows.length === 0 ? (
            <p className={`text-sm px-4 py-8 text-center border border-dashed m-4 rounded-lg ${isAgent ? "text-[color:var(--agent-muted)] border-[color:var(--agent-border)]" : "text-slate-500 border-white/20"}`}>
              Add rows in the portfolio editor.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className={`w-full text-sm text-left ${isAgent ? "text-[color:var(--agent-text)]" : "text-slate-300"}`}>
                <thead className={`text-xs uppercase ${isAgent ? "text-[color:var(--agent-muted)] bg-white/5" : "text-slate-400 bg-slate-900/50"}`}>
                  <tr>
                    {columns.map((col) => (
                      <th key={col} className="px-4 py-3 font-medium whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
                    <tr key={ri} className={isAgent ? "border-t border-[color:var(--agent-border)] hover:bg-white/5" : "border-t border-white/10 hover:bg-white/5"}>
                      {columns.map((col) => (
                        <td key={col} className="px-4 py-3 align-top max-w-[14rem]">
                          {row[col] != null && row[col] !== "" ? String(row[col]) : "—"}
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
