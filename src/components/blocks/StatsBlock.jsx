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

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className={`max-w-7xl mx-auto px-4 grid gap-8 grid-cols-1 ${GRID_COLS[visible.length] || "grid-cols-4"}`}>
        {visible.map(({ key, label, icon: Icon, suffix }, i) => (
          <div
            key={key}
            className="text-center group"
            style={{ animation: `fadeInUp 0.6s ease-out ${i * 0.15}s both` }}
          >
            <div className="bg-blue-50 group-hover:bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 transition-colors">
              <Icon className="text-blue-600 text-2xl" />
            </div>
            <div className="text-3xl lg:text-4xl font-bold text-blue-600">
              {data[key]}{suffix}
            </div>
            <div className="text-gray-600 font-medium mt-1">{label}</div>
          </div>
        ))}
      </div>
      <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </section>
  );
}
