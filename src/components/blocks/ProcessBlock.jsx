export default function ProcessBlock({ template, ...data }) {
  const steps = data.steps || [];
  const sectionTitle = data.sectionTitle || "Our Process";

  if (steps.length === 0) return null;

  const isDS = template === "dataScientist";
  const isAgent = template === "agent";
  const isHealthcare = template === "healthcare";
  const isProjectManager = template === "projectManager";

  const sectionClass = isDS
    ? "py-10 bg-transparent"
    : isAgent
      ? "py-16"
      : isHealthcare
        ? "py-16 bg-gray-50"
        : isProjectManager
          ? "py-16 bg-slate-800"
          : "py-16 bg-transparent";

  const titleClass = isDS
    ? "text-3xl font-bold text-center text-[color:var(--ds-text)] mb-12"
    : isAgent
      ? "text-3xl font-bold text-center text-[color:var(--agent-text)] mb-12"
      : isProjectManager
        ? "text-3xl font-bold text-center text-white mb-12"
        : "text-3xl font-bold text-center text-gray-900 mb-12";

  const stepNumClass = isDS
    ? "shrink-0 w-12 h-12 rounded-full border border-[color:var(--ds-border)] bg-black/25 text-[color:var(--ds-accent)] flex items-center justify-center text-xl font-bold shadow-md"
    : isAgent
      ? "shrink-0 w-12 h-12 rounded-full border border-[color:var(--agent-border)] bg-white/10 text-[color:var(--agent-accent)] flex items-center justify-center text-xl font-bold shadow-md"
      : "shrink-0 w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center text-xl font-bold shadow-md";

  const stepTitleClass = isDS
    ? "text-xl font-bold text-[color:var(--ds-text)]"
    : isAgent
      ? "text-xl font-bold text-[color:var(--agent-text)]"
      : isProjectManager
        ? "text-xl font-bold text-white"
        : "text-xl font-bold text-gray-900";

  const stepDescClass = isDS
    ? "text-[color:var(--ds-text-muted)] mt-1"
    : isAgent
      ? "text-[color:var(--agent-muted)] mt-1"
      : isProjectManager
        ? "text-slate-300 mt-1"
        : "text-gray-600 mt-1";

  return (
    <section className={sectionClass}>
      <div className="max-w-4xl mx-auto px-4">
        <h2 className={titleClass}>{sectionTitle}</h2>
        <div className="space-y-8">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-6 items-start">
              <div className={stepNumClass}>{step.number || i + 1}</div>
              <div>
                <h3 className={stepTitleClass}>{step.title}</h3>
                <p className={stepDescClass}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
