function initials(name = "") {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function TeamBlock({ template, ...data }) {
  const items = Array.isArray(data.items) ? data.items.filter(Boolean) : [];
  const isAgent = template === "agent";
  const shellClass = isAgent
    ? "agent-panel rounded-[1.75rem] p-6 md:p-8"
    : "max-w-5xl mx-auto rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm";
  const cardClass = isAgent
    ? "agent-panel-alt rounded-2xl p-5"
    : "rounded-xl border border-gray-200 bg-gray-50 p-5";

  return (
    <section className={isAgent ? "py-12" : "py-12 bg-white"}>
      <div className="mx-auto max-w-5xl px-4">
        <div className={shellClass}>
          <div className="mb-6">
            <h2 className={isAgent ? "text-3xl font-bold text-[color:var(--agent-text)]" : "text-3xl font-bold text-gray-900"}>
              {data.sectionTitle || "Team"}
            </h2>
            {data.sectionIntro && (
              <p className={isAgent ? "mt-2 text-[color:var(--agent-muted)]" : "mt-2 text-gray-600"}>
                {data.sectionIntro}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(items.length ? items : [{ name: "", role: "", bio: "", imageUrl: "" }]).map((item, index) => (
              <div key={index} className={cardClass}>
                <div className="mb-4 flex items-center gap-4">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name || "Team member"} className="h-16 w-16 rounded-2xl object-cover" />
                  ) : (
                    <div
                      className={isAgent ? "flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-lg font-semibold text-[color:var(--agent-text)]" : "flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-200 text-lg font-semibold text-gray-700"}
                    >
                      {initials(item.name || "TM") || "TM"}
                    </div>
                  )}
                  <div>
                    <h3 className={isAgent ? "text-lg font-semibold text-[color:var(--agent-text)]" : "text-lg font-semibold text-gray-900"}>
                      {item.name || "Team member"}
                    </h3>
                    <p className={isAgent ? "text-sm text-[color:var(--agent-accent)]" : "text-sm text-blue-700"}>
                      {item.role || "Role"}
                    </p>
                  </div>
                </div>

                <p className={isAgent ? "text-sm leading-relaxed text-[color:var(--agent-text)]/85" : "text-sm leading-relaxed text-gray-600"}>
                  {item.bio || "Add a short bio that explains this person's contribution."}
                </p>

                {item.profileUrl && (
                  <a
                    href={item.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={isAgent ? "mt-4 inline-flex text-sm font-medium text-[color:var(--agent-accent)] hover:opacity-80" : "mt-4 inline-flex text-sm font-medium text-blue-700 hover:text-blue-900"}
                  >
                    View profile
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
