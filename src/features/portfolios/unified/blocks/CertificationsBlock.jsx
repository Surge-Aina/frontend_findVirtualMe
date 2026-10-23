function formatDateRange(earnedDate, expiresDate) {
  const parts = [earnedDate, expiresDate ? `Expires ${expiresDate}` : ""].filter(Boolean);
  return parts.join(" · ");
}

export default function CertificationsBlock({ template, ...data }) {
  const items = Array.isArray(data.items) ? data.items.filter(Boolean) : [];
  const isAgent = template === "agent";
  const shellClass = isAgent
    ? "agent-panel rounded-[1.75rem] p-6 md:p-8"
    : "max-w-4xl mx-auto rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm";
  const cardClass = isAgent
    ? "agent-panel-alt rounded-2xl p-5"
    : "rounded-xl border border-gray-200 bg-gray-50 p-5";

  return (
    <section className={isAgent ? "py-12" : "py-12 bg-white"}>
      <div className="mx-auto max-w-4xl px-4">
        <div className={shellClass}>
          <div className="mb-6">
            <h2 className={isAgent ? "text-3xl font-bold text-[color:var(--agent-text)]" : "text-3xl font-bold text-gray-900"}>
              {data.sectionTitle || "Certifications"}
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {(items.length ? items : [{ name: "", issuer: "", credentialId: "" }]).map((item, index) => (
              <div key={index} className={cardClass}>
                <h3 className={isAgent ? "text-lg font-semibold text-[color:var(--agent-text)]" : "text-lg font-semibold text-gray-900"}>
                  {item.name || "Add a credential"}
                </h3>
                <p className={isAgent ? "mt-1 text-sm text-[color:var(--agent-accent)]" : "mt-1 text-sm text-blue-700"}>
                  {item.issuer || "Issuing organization"}
                </p>
                {(item.credentialId || item.earnedDate || item.expiresDate) && (
                  <p className={isAgent ? "mt-2 text-sm text-[color:var(--agent-muted)]" : "mt-2 text-sm text-gray-500"}>
                    {[item.credentialId, formatDateRange(item.earnedDate, item.expiresDate)].filter(Boolean).join(" · ")}
                  </p>
                )}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={isAgent ? "mt-3 inline-flex text-sm font-medium text-[color:var(--agent-accent)] hover:opacity-80" : "mt-3 inline-flex text-sm font-medium text-blue-700 hover:text-blue-900"}
                  >
                    Verify credential
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
