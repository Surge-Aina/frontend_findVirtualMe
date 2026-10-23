export default function LanguagesBlock({ template, ...data }) {
  const items = Array.isArray(data.items) ? data.items.filter(Boolean) : [];
  const isAgent = template === "agent";
  const shellClass = isAgent
    ? "agent-panel rounded-[1.75rem] p-6 md:p-8"
    : "max-w-4xl mx-auto rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm";
  const chipClass = isAgent
    ? "rounded-2xl border border-[color:var(--agent-border)] bg-white/5 px-4 py-3"
    : "rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3";

  return (
    <section className={isAgent ? "py-12" : "py-12 bg-white"}>
      <div className="mx-auto max-w-4xl px-4">
        <div className={shellClass}>
          <div className="mb-6">
            <h2 className={isAgent ? "text-3xl font-bold text-[color:var(--agent-text)]" : "text-3xl font-bold text-gray-900"}>
              {data.sectionTitle || "Languages"}
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {(items.length ? items : [{ name: "", proficiency: "" }]).map((item, index) => (
              <div key={index} className={chipClass}>
                <p className={isAgent ? "font-semibold text-[color:var(--agent-text)]" : "font-semibold text-gray-900"}>
                  {item.name || "Language"}
                </p>
                <p className={isAgent ? "text-sm text-[color:var(--agent-muted)]" : "text-sm text-gray-500"}>
                  {item.proficiency || "Proficiency"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
