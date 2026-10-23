import { FaBriefcase } from "react-icons/fa";

function formatDate(d) {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function ExperienceBlock({ template, ...data }) {
  const items = data.items || [];
  const isAgent = template === "agent";
  const isPM = template === "projectManager" || template === "dataScientist" || isAgent;
  const isDS = template === "dataScientist";
  if (items.length === 0 && !isPM) return null;

  const cardClass = isDS
    ? "border border-[var(--ds-border)] rounded-lg p-5 bg-black/25 font-mono text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
    : isAgent
      ? "agent-panel-alt rounded-[1.5rem] p-6"
    : "bg-slate-700/50 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg p-6";

  return (
    <section className={isDS ? "py-10 bg-transparent" : isAgent ? "py-12" : "py-12 bg-slate-800"}>
      <div className="max-w-4xl mx-auto px-4">
        <div className={isDS ? "ds-panel p-6 md:p-8" : isAgent ? "agent-panel rounded-[1.75rem] p-6 md:p-8" : ""}>
          {isDS ? (
            <h2 className="ds-section-heading font-mono">experience.log</h2>
          ) : isAgent ? (
            <h2 className="text-3xl font-bold mb-8 text-[color:var(--agent-text)]">Experience</h2>
          ) : (
            <h2 className="text-3xl font-bold text-white mb-8">Experience</h2>
          )}
          {items.length === 0 ? (
            <p
              className={
                isDS
                  ? "text-[var(--ds-dim)] italic border border-dashed border-[var(--ds-border)] rounded-lg px-4 py-6 text-center text-sm font-mono"
                  : isAgent
                    ? "text-[color:var(--agent-muted)] italic border border-dashed border-[color:var(--agent-border)] rounded-xl px-4 py-6 text-center"
                  : "text-slate-500 italic border border-dashed border-white/15 rounded-lg px-4 py-6 text-center"
              }
            >
              {isDS ? (
                <>
                  Add roles and impact — <code className="text-[var(--ds-accent)]">vim</code> this section from the editor.
                </>
              ) : isAgent ? (
                "Add roles, engagements, or major milestones that make this custom portfolio credible."
              ) : (
                "Add roles and impact here from the editor — recruiters scan this section first."
              )}
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((exp, i) => (
                <div key={i} className={cardClass}>
                  <div className="flex items-start gap-4">
                    <div
                      className={
                        isDS
                          ? "bg-emerald-500/15 rounded-sm p-2 mt-0.5 border border-emerald-500/30"
                          : isAgent
                            ? "rounded-2xl p-3 mt-1 bg-white/5 border border-[color:var(--agent-border)]"
                            : "bg-blue-500/20 rounded-full p-3 mt-1"
                      }
                    >
                      <FaBriefcase className={isDS ? "text-emerald-400 text-sm" : isAgent ? "text-[color:var(--agent-accent)]" : "text-blue-400"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold ${isDS ? "text-[var(--ds-text)] text-base" : isAgent ? "text-lg text-[color:var(--agent-text)]" : "text-lg text-white"}`}>
                        {exp.title}
                      </h3>
                      <p className={isDS ? "text-emerald-400/90 text-xs mt-0.5" : isAgent ? "text-[color:var(--agent-accent)] text-sm mt-1" : "text-blue-300"}>{exp.company}</p>
                      <div className={`flex flex-wrap gap-3 mt-2 text-xs ${isDS ? "text-[var(--ds-dim)]" : isAgent ? "text-[color:var(--agent-muted)]" : "text-slate-400"}`}>
                        {exp.location && <span>{exp.location}</span>}
                        <span
                          className={
                            isDS
                              ? "text-emerald-600/80 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"
                              : isAgent
                                ? "px-2 py-0.5 rounded-full border border-[color:var(--agent-border)] bg-white/5"
                              : "bg-slate-600 px-2 py-0.5 rounded-full"
                          }
                        >
                          {formatDate(exp.startDate)} — {exp.endDate ? formatDate(exp.endDate) : "Present"}
                        </span>
                      </div>
                      {exp.description && (
                        <p className={`mt-3 ${isDS ? "text-[var(--ds-text-muted)] leading-relaxed" : isAgent ? "text-[color:var(--agent-muted)] leading-relaxed" : "text-slate-300"}`}>
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
