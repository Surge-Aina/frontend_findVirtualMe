import { FaUserMd, FaUsers, FaChartLine, FaAward } from "react-icons/fa";

const STAT_CONFIG = [
  { key: "yearsExperience", label: "Years Experience", icon: FaAward, suffix: "+" },
  { key: "patientsServed", label: "Patients Served", icon: FaUsers, suffix: "+" },
  { key: "successRate", label: "Success Rate", icon: FaChartLine, suffix: "%" },
  { key: "doctorsCount", label: "Doctors", icon: FaUserMd, suffix: "+" },
];

const GRID_COLS = ["", "max-w-xs mx-auto", "max-w-md mx-auto grid-cols-2", "max-w-3xl mx-auto grid-cols-3", "grid-cols-4"];

export default function StatsBlock({ template, ...data }) {
  const showSection = data.showStatsSection ?? true;
  if (!showSection) return null;

  const visibility = data.visibility || {};
  const visible = STAT_CONFIG.filter((s) => visibility[s.key] !== false && data[s.key]);

  if (visible.length === 0) return null;

  const isDS = template === "dataScientist";
  const isAgent = template === "agent";
  const isHealthcare = template === "healthcare";
  const isProjectManager = template === "projectManager";

  const sectionClass = isDS
    ? "py-10 bg-transparent"
    : isAgent
      ? "py-16 lg:py-24"
      : isHealthcare
        ? "py-16 lg:py-24 bg-gray-50"
        : isProjectManager
          ? "py-16 lg:py-24 bg-slate-800"
          : "py-16 lg:py-24 bg-transparent";

  const iconWrapClass = isDS
    ? "rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 transition-colors border border-[color:var(--ds-border)] bg-black/25 group-hover:bg-black/35"
    : isAgent
      ? "rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 transition-colors border border-[color:var(--agent-border)] bg-white/10 group-hover:bg-white/15"
      : isProjectManager
        ? "bg-blue-500/20 group-hover:bg-blue-500/30 border border-blue-400/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 transition-colors"
        : "bg-blue-50 group-hover:bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 transition-colors";

  const iconClass = isDS
    ? "text-[color:var(--ds-accent)] text-2xl"
    : isAgent
      ? "text-[color:var(--agent-accent)] text-2xl"
      : isProjectManager
        ? "text-blue-300 text-2xl"
        : "text-blue-600 text-2xl";

  const valueClass = isDS
    ? "text-3xl lg:text-4xl font-bold text-[color:var(--ds-accent)]"
    : isAgent
      ? "text-3xl lg:text-4xl font-bold text-[color:var(--agent-accent)]"
      : isProjectManager
        ? "text-3xl lg:text-4xl font-bold text-blue-200"
        : "text-3xl lg:text-4xl font-bold text-blue-600";

  const labelClass = isDS
    ? "text-[color:var(--ds-text-muted)] font-medium mt-1"
    : isAgent
      ? "text-[color:var(--agent-muted)] font-medium mt-1"
      : isProjectManager
        ? "text-slate-300 font-medium mt-1"
        : "text-gray-600 font-medium mt-1";

  return (
    <section className={sectionClass}>
      <div className={`max-w-7xl mx-auto px-4 grid gap-8 grid-cols-1 ${GRID_COLS[visible.length] || "grid-cols-4"}`}>
        {visible.map(({ key, label, icon: IconComponent, suffix }, i) => (
          <div
            key={key}
            className="text-center group"
            style={{ animation: `fadeInUp 0.6s ease-out ${i * 0.15}s both` }}
          >
            <div className={iconWrapClass}>
              <IconComponent className={iconClass} />
            </div>
            <div className={valueClass}>
              {data[key]}
              {suffix}
            </div>
            <div className={labelClass}>{label}</div>
          </div>
        ))}
      </div>
      <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </section>
  );
}
