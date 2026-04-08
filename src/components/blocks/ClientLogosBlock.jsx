function getInitials(name = "") {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function ClientLogosBlock({ template, ...data }) {
  const items = Array.isArray(data.items) ? data.items.filter(Boolean) : [];
  const isAgent = template === "agent";
  const shellClass = isAgent
    ? "agent-panel rounded-[1.75rem] p-6 md:p-8"
    : "max-w-5xl mx-auto rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm";
  const tileClass = isAgent
    ? "agent-panel-alt rounded-2xl p-5 flex items-center justify-center min-h-[120px]"
    : "rounded-xl border border-gray-200 bg-gray-50 p-5 flex items-center justify-center min-h-[120px]";

  return (
    <section className={isAgent ? "py-12" : "py-12 bg-white"}>
      <div className="mx-auto max-w-5xl px-4">
        <div className={shellClass}>
          <div className="mb-6 text-center">
            <h2 className={isAgent ? "text-3xl font-bold text-[color:var(--agent-text)]" : "text-3xl font-bold text-gray-900"}>
              {data.sectionTitle || "Trusted By"}
            </h2>
            {data.sectionIntro && (
              <p className={isAgent ? "mt-2 text-[color:var(--agent-muted)]" : "mt-2 text-gray-600"}>
                {data.sectionIntro}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(items.length ? items : [{ name: "Client", logoUrl: "", url: "" }]).map((item, index) => {
              const content = item.logoUrl ? (
                <img src={item.logoUrl} alt={item.name || "Client logo"} className="max-h-12 w-auto max-w-full object-contain" />
              ) : (
                <span className={isAgent ? "text-lg font-semibold tracking-[0.2em] text-[color:var(--agent-muted)]" : "text-lg font-semibold tracking-[0.2em] text-gray-500"}>
                  {getInitials(item.name || "Client") || "CL"}
                </span>
              );

              const inner = (
                <div className={tileClass}>
                  {content}
                </div>
              );

              return item.url ? (
                <a key={index} href={item.url} target="_blank" rel="noopener noreferrer" aria-label={item.name || "Client"} className="block hover:opacity-90">
                  {inner}
                </a>
              ) : (
                <div key={index}>
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
