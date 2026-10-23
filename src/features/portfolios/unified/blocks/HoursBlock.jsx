import { FaClock } from "react-icons/fa";

export default function HoursBlock({ template, ...data }) {
  const entries = [
    { label: "Weekdays", value: data.weekdays },
    { label: "Saturday", value: data.saturday },
    { label: "Sunday", value: data.sunday },
  ].filter((e) => e.value);

  if (entries.length === 0) return null;

  const isDS = template === "dataScientist";
  const isAgent = template === "agent";
  const isHealthcare = template === "healthcare";
  const isProjectManager = template === "projectManager";

  const sectionClass = isDS
    ? "py-10 bg-transparent"
    : isAgent
      ? "py-12"
      : isHealthcare
        ? "py-12 bg-gray-50"
        : isProjectManager
          ? "py-12 bg-slate-800"
          : "py-12 bg-transparent";

  const clockClass = isDS
    ? "text-[color:var(--ds-accent)] text-xl"
    : isAgent
      ? "text-[color:var(--agent-accent)] text-xl"
      : isProjectManager
        ? "text-blue-300 text-xl"
        : "text-blue-600 text-xl";

  const headingClass = isDS
    ? "text-2xl font-bold text-[color:var(--ds-text)]"
    : isAgent
      ? "text-2xl font-bold text-[color:var(--agent-text)]"
      : isProjectManager
        ? "text-2xl font-bold text-white"
        : "text-2xl font-bold text-gray-900";

  const panelClass = isDS
    ? "rounded-xl border border-[color:var(--ds-border)] bg-black/25 p-6 space-y-3 backdrop-blur-sm"
    : isAgent
      ? "agent-panel-alt rounded-xl p-6 space-y-3"
      : isProjectManager
        ? "rounded-xl border border-white/10 bg-slate-700/50 backdrop-blur-lg p-6 space-y-3"
        : "bg-gray-50 rounded-xl p-6 space-y-3 border border-gray-100";

  const rowClass = isDS
    ? "flex justify-between text-[color:var(--ds-text)]"
    : isAgent
      ? "flex justify-between text-[color:var(--agent-text)]"
      : isProjectManager
        ? "flex justify-between text-slate-200"
        : "flex justify-between text-gray-700";

  const labelClass = isDS ? "font-medium" : isAgent ? "font-medium" : isProjectManager ? "font-medium text-slate-300" : "font-medium";

  return (
    <section className={sectionClass}>
      <div className="max-w-xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <FaClock className={clockClass} />
          <h2 className={headingClass}>Business Hours</h2>
        </div>
        <div className={panelClass}>
          {entries.map(({ label, value }) => (
            <div key={label} className={rowClass}>
              <span className={labelClass}>{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
