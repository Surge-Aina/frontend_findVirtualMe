export default function SkillsBlock({ template, ...data }) {
  const items = data.items || [];
  const isAgent = template === "agent";
  const isPM = template === "projectManager" || template === "dataScientist" || isAgent;
  const isDS = template === "dataScientist";
  const sectionClass = isDS ? "py-10 bg-transparent" : isAgent ? "py-12" : "py-12 bg-slate-800";
  const shellClass = isDS ? "ds-panel p-6 md:p-8" : isAgent ? "agent-panel rounded-[1.75rem] p-6 md:p-8" : "";
  if (items.length === 0 && !isPM) return null;

  return (
    <section className={sectionClass}>
      <div className="max-w-4xl mx-auto px-4">
        <div className={shellClass}>
          {isDS ? (
            <h2 className="ds-section-heading font-mono">skills.sh</h2>
          ) : isAgent ? (
            <h2 className="text-3xl font-bold mb-8 text-[color:var(--agent-text)]">Capabilities</h2>
          ) : (
            <h2 className="text-3xl font-bold text-white mb-8">Skills</h2>
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
              No skills yet. Open <strong className={isDS ? "text-[var(--ds-text)]" : isAgent ? "text-[color:var(--agent-text)]" : "text-slate-300"}>Edit</strong> to add
              tools and technologies.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {items.map((skill, i) => (
                <span
                  key={i}
                  className={
                    isDS
                      ? "font-mono text-xs sm:text-sm bg-black/30 text-emerald-300/95 px-3 py-1.5 rounded border border-[var(--ds-border)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                      : isAgent
                        ? "px-4 py-2 rounded-full text-sm font-medium border bg-white/5 text-[color:var(--agent-text)] border-[color:var(--agent-border)]"
                      : "bg-blue-500/20 text-blue-200 px-4 py-2 rounded-full text-sm font-medium border border-blue-400/30"
                  }
                >
                  {isDS ? `$ ${skill}` : skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
