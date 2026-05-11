import { FaGraduationCap } from "react-icons/fa";

function formatDate(d) {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function EducationBlock({ template, ...data }) {
  const items = data.items || [];
  const isAgent = template === "agent";
  const isPM = template === "projectManager" || template === "dataScientist" || isAgent;
  const isDS = template === "dataScientist";
  if (items.length === 0 && !isPM) return null;

  const cardClass = isDS
    ? "border border-[var(--ds-border)] rounded-lg p-5 bg-black/25 font-mono text-sm"
    : isAgent
      ? "agent-panel-alt rounded-[1.5rem] p-6"
    : "bg-slate-700/50 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg p-6";

  return (
    <section className={isDS ? "py-10 bg-transparent" : isAgent ? "py-12" : "py-12 bg-slate-800"}>
      <div className="max-w-4xl mx-auto px-4">
        <div className={isDS ? "ds-panel p-6 md:p-8" : isAgent ? "agent-panel rounded-[1.75rem] p-6 md:p-8" : ""}>
          {isDS ? (
            <h2 className="ds-section-heading font-mono">education.json</h2>
          ) : isAgent ? (
            <h2 className="text-3xl font-bold mb-8 text-[color:var(--agent-text)]">Education</h2>
          ) : (
            <h2 className="text-3xl font-bold text-white mb-8">Education</h2>
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
              {isAgent
                ? "List studies, certifications, apprenticeships, or training relevant to this portfolio."
                : "List degrees and certifications — edit to append entries."}
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((edu, i) => (
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
                      <FaGraduationCap className={isDS ? "text-emerald-400 text-sm" : isAgent ? "text-[color:var(--agent-accent)]" : "text-blue-400"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold ${isDS ? "text-[var(--ds-text)] text-base" : isAgent ? "text-lg text-[color:var(--agent-text)]" : "text-lg text-white"}`}>
                        {edu.school}
                      </h3>
                      {edu.fieldOfStudy && (
                        <p className={isDS ? "text-emerald-400/85 text-xs mt-0.5" : isAgent ? "text-[color:var(--agent-accent)] text-sm mt-1" : "text-blue-300"}>{edu.fieldOfStudy}</p>
                      )}
                      <div className={`flex flex-wrap gap-3 mt-2 text-xs ${isDS ? "text-[var(--ds-dim)]" : isAgent ? "text-[color:var(--agent-muted)]" : "text-slate-400"}`}>
                        {edu.gpa && <span>GPA: {edu.gpa}</span>}
                        <span
                          className={
                            isDS
                              ? "text-emerald-600/80 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"
                              : isAgent
                                ? "px-2 py-0.5 rounded-full border border-[color:var(--agent-border)] bg-white/5"
                              : "bg-slate-600 px-2 py-0.5 rounded-full"
                          }
                        >
                          {formatDate(edu.startDate)} — {edu.endDate ? formatDate(edu.endDate) : "Present"}
                        </span>
                      </div>
                      {edu.degrees?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {edu.degrees.map((deg, j) => (
                            <span
                              key={j}
                              className={
                                isDS
                                  ? "font-mono text-xs bg-black/30 text-emerald-300/90 px-2 py-1 rounded border border-[var(--ds-border)]"
                                  : isAgent
                                    ? "text-xs px-3 py-1 rounded-full border border-[color:var(--agent-border)] bg-white/5 text-[color:var(--agent-text)]"
                                  : "bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-xs border border-blue-400/30"
                              }
                            >
                              {deg}
                            </span>
                          ))}
                        </div>
                      )}
                      {edu.awards?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {edu.awards.map((award, j) => (
                            <span
                              key={j}
                              className={
                                isDS
                                  ? "font-mono text-xs bg-amber-500/10 text-amber-200/90 px-2 py-1 rounded border border-amber-500/25"
                                  : isAgent
                                    ? "text-xs px-3 py-1 rounded-full border border-[color:var(--agent-border)] bg-white/5 text-[color:var(--agent-accent-strong)]"
                                  : "bg-amber-500/20 text-amber-200 px-3 py-1 rounded-full text-xs border border-amber-400/30"
                              }
                            >
                              {award}
                            </span>
                          ))}
                        </div>
                      )}
                      {edu.description && (
                        <p className={`mt-3 ${isDS ? "text-[var(--ds-text-muted)]" : isAgent ? "text-[color:var(--agent-muted)]" : "text-slate-300"}`}>{edu.description}</p>
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
