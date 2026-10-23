import { FaExternalLinkAlt } from "react-icons/fa";

export default function ProjectsBlock({ template, ...data }) {
  const items = data.items || [];
  const isAgent = template === "agent";
  const isPM = template === "projectManager" || template === "dataScientist" || isAgent;
  const isDS = template === "dataScientist";
  if (items.length === 0 && !isPM) return null;

  const cardClass = isDS
    ? "border border-[var(--ds-border)] rounded-lg p-5 bg-black/25 font-mono text-sm flex flex-col min-h-[180px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
    : isAgent
      ? "agent-panel-alt rounded-[1.5rem] p-6 flex flex-col min-h-[200px]"
    : "bg-slate-700/50 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg p-6 flex flex-col min-h-[200px]";

  return (
    <section className={isDS ? "py-10 bg-transparent" : isAgent ? "py-12" : "py-12 bg-slate-800"}>
      <div className="max-w-4xl mx-auto px-4">
        <div className={isDS ? "ds-panel p-6 md:p-8" : isAgent ? "agent-panel rounded-[1.75rem] p-6 md:p-8" : ""}>
          {isDS ? (
            <h2 className="ds-section-heading font-mono">~/projects</h2>
          ) : isAgent ? (
            <h2 className="text-3xl font-bold mb-8 text-[color:var(--agent-text)]">Selected Work</h2>
          ) : (
            <h2 className="text-3xl font-bold text-white mb-8">Projects</h2>
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
              {isDS
                ? "No repositories in workspace — add projects from the editor."
                : isAgent
                  ? "Add examples, offerings, or case studies to make this custom portfolio feel unique."
                  : "Showcase products, case studies, or side projects — add them in the portfolio editor."}
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((project, i) => (
                <div key={i} className={cardClass}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className={`font-bold ${isDS ? "text-[var(--ds-text)] text-base" : isAgent ? "text-xl text-[color:var(--agent-text)]" : "text-lg text-white"}`}>
                      {project.name}
                    </h3>
                    {(isDS || isAgent) && (
                      <span
                        className={`text-[10px] shrink-0 rounded px-1.5 py-0.5 ${
                          isAgent
                            ? "text-[color:var(--agent-muted)] border border-[color:var(--agent-border)]"
                            : "text-[var(--ds-dim)] border border-[var(--ds-border-subtle)]"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    )}
                  </div>
                  {(project.about || project.description) && (
                    <p className={isDS ? "text-[var(--ds-text-muted)] text-xs flex-1 leading-relaxed" : isAgent ? "text-[color:var(--agent-muted)] text-sm flex-1 leading-relaxed" : "text-slate-300 text-sm flex-1"}>
                      {project.about || project.description}
                    </p>
                  )}
                  {project.time && (
                    <p className={isDS ? "text-[var(--ds-dim)] text-[10px] mt-2" : isAgent ? "text-[color:var(--agent-muted)] text-xs mt-2" : "text-slate-500 text-xs mt-1"}>{project.time}</p>
                  )}
                  {(project.githubUrl || project.liveUrl) && (
                    <div className={`flex flex-wrap gap-3 mt-3 text-sm ${isDS ? "font-mono text-xs" : isAgent ? "" : ""}`}>
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={isAgent ? "text-[color:var(--agent-accent)] hover:opacity-80" : "text-emerald-400 hover:text-emerald-300"}
                        >
                          {isDS ? "git clone" : "GitHub"}
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={isDS ? "text-cyan-400/90 hover:text-cyan-300" : isAgent ? "text-[color:var(--agent-accent-strong)] hover:opacity-80" : "text-blue-400 hover:text-blue-300"}
                        >
                          {isDS ? "open --url" : "Live"}
                        </a>
                      )}
                    </div>
                  )}
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 mt-4 text-sm font-medium ${
                        isDS ? "text-emerald-400/90 hover:text-emerald-300 font-mono text-xs" : isAgent ? "text-[color:var(--agent-accent)] hover:opacity-80" : "text-blue-400 hover:text-blue-300"
                      }`}
                    >
                      View Project <FaExternalLinkAlt className="text-xs" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
