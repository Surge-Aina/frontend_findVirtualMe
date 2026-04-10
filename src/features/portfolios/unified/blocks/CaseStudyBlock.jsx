import { FaArrowRight } from "react-icons/fa";

export default function CaseStudyBlock({ template, ...data }) {
  const metrics = (Array.isArray(data.metrics) ? data.metrics : []).filter((m) => String(m).trim());
  const tools = (Array.isArray(data.tools) ? data.tools : []).filter((t) => String(t).trim());
  const isAgent = template === "agent";
  const isDS = template === "dataScientist";

  const sectionClass = isDS ? "py-10 bg-transparent" : isAgent ? "py-12" : "py-12 bg-slate-800";
  const shellClass = isDS
    ? "ds-panel p-6 md:p-8"
    : isAgent
      ? "agent-panel rounded-[1.75rem] p-6 md:p-8"
      : "max-w-4xl mx-auto bg-slate-700/50 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg p-8";

  return (
    <section className={sectionClass}>
      <div className="max-w-4xl mx-auto px-4">
        <div className={shellClass}>
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h2 className={isDS ? "ds-section-heading font-mono" : isAgent ? "text-3xl font-bold text-[color:var(--agent-text)]" : "text-3xl font-bold text-white"}>
                {data.title || "Case Study"}
              </h2>
              {(data.client || data.industry) && (
                <p className={isDS ? "text-[var(--ds-dim)] font-mono text-sm" : isAgent ? "text-[color:var(--agent-muted)] text-sm" : "text-slate-400 text-sm"}>
                  {[data.client, data.industry].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>

            {data.link && (
              <a
                href={data.link}
                target="_blank"
                rel="noopener noreferrer"
                className={isDS ? "text-emerald-400 hover:text-emerald-300 text-sm font-mono inline-flex items-center gap-2" : isAgent ? "text-[color:var(--agent-accent)] hover:opacity-80 text-sm inline-flex items-center gap-2" : "text-blue-400 hover:text-blue-300 text-sm inline-flex items-center gap-2"}
              >
                View full case study <FaArrowRight className="text-xs" />
              </a>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className={isAgent ? "agent-panel-alt rounded-2xl p-5 md:col-span-1" : "bg-black/10 rounded-xl p-5 md:col-span-1"}>
              <h3 className={isAgent ? "text-sm uppercase tracking-[0.18em] text-[color:var(--agent-muted)] mb-2" : "text-sm uppercase tracking-wide text-slate-400 mb-2"}>
                Challenge
              </h3>
              <p className={isAgent ? "text-[color:var(--agent-text)]/90" : "text-slate-300"}>
                {data.challenge || "Describe the starting problem."}
              </p>
            </div>

            <div className={isAgent ? "agent-panel-alt rounded-2xl p-5 md:col-span-1" : "bg-black/10 rounded-xl p-5 md:col-span-1"}>
              <h3 className={isAgent ? "text-sm uppercase tracking-[0.18em] text-[color:var(--agent-muted)] mb-2" : "text-sm uppercase tracking-wide text-slate-400 mb-2"}>
                Solution
              </h3>
              <p className={isAgent ? "text-[color:var(--agent-text)]/90" : "text-slate-300"}>
                {data.solution || "Explain what was changed or built."}
              </p>
            </div>

            <div className={isAgent ? "agent-panel-alt rounded-2xl p-5 md:col-span-1" : "bg-black/10 rounded-xl p-5 md:col-span-1"}>
              <h3 className={isAgent ? "text-sm uppercase tracking-[0.18em] text-[color:var(--agent-muted)] mb-2" : "text-sm uppercase tracking-wide text-slate-400 mb-2"}>
                Outcome
              </h3>
              <p className={isAgent ? "text-[color:var(--agent-text)]/90" : "text-slate-300"}>
                {data.outcome || "Summarize the result."}
              </p>
            </div>
          </div>

          {metrics.length > 0 && (
            <div className="mt-6">
              <h3 className={isAgent ? "text-sm uppercase tracking-[0.18em] text-[color:var(--agent-muted)] mb-3" : "text-sm uppercase tracking-wide text-slate-400 mb-3"}>
                Metrics
              </h3>
              <div className="flex flex-wrap gap-2">
                {metrics.map((metric, index) => (
                  <span
                    key={index}
                    className={isAgent ? "px-3 py-1 rounded-full border border-[color:var(--agent-border)] bg-white/5 text-[color:var(--agent-text)] text-sm" : "bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-sm border border-blue-400/30"}
                  >
                    {metric}
                  </span>
                ))}
              </div>
            </div>
          )}

          {tools.length > 0 && (
            <div className="mt-6">
              <h3 className={isAgent ? "text-sm uppercase tracking-[0.18em] text-[color:var(--agent-muted)] mb-3" : "text-sm uppercase tracking-wide text-slate-400 mb-3"}>
                Tools
              </h3>
              <p className={isAgent ? "text-[color:var(--agent-muted)]" : "text-slate-300"}>
                {tools.join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}