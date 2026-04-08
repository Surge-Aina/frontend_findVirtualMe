import { FaQuoteLeft } from "react-icons/fa";

export default function TestimonialsBlock({ template, ...data }) {
  const items = data.items || [];
  const sectionTitle = data.sectionTitle || "What Our Clients Say";

  if (items.length === 0) return null;

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

  const cardClass = isDS
    ? "rounded-xl border border-[color:var(--ds-border)] bg-black/25 p-8 shadow-lg backdrop-blur-sm"
    : isAgent
      ? "agent-panel-alt rounded-xl p-8 shadow-md"
      : isProjectManager
        ? "rounded-xl border border-white/10 bg-slate-700/50 backdrop-blur-lg p-8 shadow-md"
        : "bg-gray-50 rounded-xl p-8 shadow-md border border-gray-100";

  const quoteIconClass = isDS
    ? "text-[color:var(--ds-accent)] text-2xl mb-4"
    : isAgent
      ? "text-[color:var(--agent-accent)] text-2xl mb-4"
      : isProjectManager
        ? "text-amber-300 text-2xl mb-4"
        : "text-amber-400 text-2xl mb-4";

  const quoteClass = isDS
    ? "text-[color:var(--ds-text-muted)] italic mb-6"
    : isAgent
      ? "text-[color:var(--agent-text)]/90 italic mb-6"
      : isProjectManager
        ? "text-slate-300 italic mb-6"
        : "text-gray-700 italic mb-6";

  const dividerClass = isDS
    ? "border-t border-[color:var(--ds-border-subtle)] pt-4"
    : isAgent
      ? "border-t border-[color:var(--agent-border)] pt-4"
      : isProjectManager
        ? "border-t border-white/10 pt-4"
        : "border-t border-gray-200 pt-4";

  const nameClass = isDS
    ? "font-bold text-[color:var(--ds-text)]"
    : isAgent
      ? "font-bold text-[color:var(--agent-text)]"
      : isProjectManager
        ? "font-bold text-white"
        : "font-bold text-gray-900";

  const metaClass = isDS
    ? "text-sm text-[color:var(--ds-dim)]"
    : isAgent
      ? "text-sm text-[color:var(--agent-muted)]"
      : isProjectManager
        ? "text-sm text-slate-400"
        : "text-sm text-gray-500";

  return (
    <section className={sectionClass}>
      <div className="max-w-7xl mx-auto px-4">
        <h2 className={titleClass}>{sectionTitle}</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <div key={i} className={cardClass}>
              <FaQuoteLeft className={quoteIconClass} />
              <p className={quoteClass}>&ldquo;{t.quote}&rdquo;</p>
              <div className={dividerClass}>
                <p className={nameClass}>{t.name}</p>
                <p className={metaClass}>{[t.service, t.location].filter(Boolean).join(" · ")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
