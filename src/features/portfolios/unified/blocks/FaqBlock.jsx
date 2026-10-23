function toItems(items) {
  return Array.isArray(items) ? items.filter(Boolean) : [];
}

export default function FaqBlock({ template, ...data }) {
  const items = toItems(data.items);
  const isAgent = template === "agent";
  const sectionClass = isAgent ? "py-12" : "py-12 bg-white";
  const shellClass = isAgent
    ? "agent-panel rounded-[1.75rem] p-6 md:p-8"
    : "max-w-4xl mx-auto rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm";
  const cardClass = isAgent
    ? "agent-panel-alt rounded-2xl p-5"
    : "rounded-xl border border-gray-200 bg-gray-50 p-5";

  return (
    <section className={sectionClass}>
      <div className="mx-auto max-w-4xl px-4">
        <div className={shellClass}>
          <div className="mb-6">
            <h2 className={isAgent ? "text-3xl font-bold text-[color:var(--agent-text)]" : "text-3xl font-bold text-gray-900"}>
              {data.sectionTitle || "Frequently Asked Questions"}
            </h2>
            {data.sectionIntro && (
              <p className={isAgent ? "mt-2 text-[color:var(--agent-muted)]" : "mt-2 text-gray-600"}>
                {data.sectionIntro}
              </p>
            )}
          </div>

          <div className="space-y-4">
            {(items.length ? items : [{ question: "", answer: "" }]).map((item, index) => (
              <div key={index} className={cardClass}>
                <h3 className={isAgent ? "text-lg font-semibold text-[color:var(--agent-text)]" : "text-lg font-semibold text-gray-900"}>
                  {item.question || "Add a common question"}
                </h3>
                <p className={isAgent ? "mt-2 text-[color:var(--agent-text)]/85" : "mt-2 text-gray-600"}>
                  {item.answer || "Add a short answer that reduces friction and builds confidence."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
