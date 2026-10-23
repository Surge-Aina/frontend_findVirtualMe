import { FaCheck } from "react-icons/fa";

function HealthcareServices({ items = [] }) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Services</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((service, i) => (
            <div key={service.id || i} className="bg-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all p-8">
              {service.image ? (
                <img src={service.image} alt={service.title} className="w-full h-48 object-cover rounded-lg mb-4" />
              ) : service.icon ? (
                <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                  <span className="text-blue-600 text-3xl">{service.icon}</span>
                </div>
              ) : null}
              <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              {service.price && (
                <p className="text-blue-600 font-semibold mb-2">
                  {service.price} {service.duration && `· ${service.duration}`}
                </p>
              )}
              {(service.features || []).filter((f) => String(f).trim()).length > 0 && (
                <ul className="space-y-2">
                  {(service.features || [])
                    .filter((f) => String(f).trim())
                    .map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-gray-600 text-sm">
                        <FaCheck className="text-green-500 shrink-0" /> {f}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HandymanServices({ sectionTitle, sectionIntro, items = [] }) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {sectionTitle && <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">{sectionTitle}</h2>}
        {sectionIntro && <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">{sectionIntro}</p>}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((service, i) => (
            <article key={i} className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
              {service.icon && <div className="text-4xl mb-4">{service.icon}</div>}
              <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              {(service.bullets || []).filter((b) => String(b).trim()).length > 0 && (
                <ul className="space-y-2">
                  {(service.bullets || [])
                    .filter((b) => String(b).trim())
                    .map((b, j) => (
                      <li key={j} className="flex items-center gap-2 text-gray-600 text-sm">
                        <FaCheck className="text-amber-500 shrink-0" /> {b}
                      </li>
                    ))}
                </ul>
              )}
              {service.price != null && (
                <p className="mt-4 text-amber-600 font-semibold">${service.price}</p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AgentServices(data) {
  const items = Array.isArray(data.items) ? data.items : [];
  if (items.length === 0) return null;

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="agent-panel rounded-[1.75rem] p-6 md:p-8">
          <h2 className="text-3xl font-bold text-[color:var(--agent-text)] mb-4">
            {data.sectionTitle || "Services"}
          </h2>
          {(data.sectionIntro || data.viewAllText || data.bookButtonText) && (
            <p className="text-[color:var(--agent-muted)] max-w-3xl mb-10">
              {data.sectionIntro ||
                "Choose the mix of offers, specialties, or deliverables that best describes this custom portfolio."}
            </p>
          )}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((service, i) => {
              const entryLines = [...(service.features || []), ...(service.bullets || [])].filter((e) =>
                String(e).trim()
              );
              return (
                <article key={service.id || i} className="agent-panel-alt rounded-[1.5rem] p-6">
                  {(service.icon || service.image) &&
                    (service.image ? (
                      <img
                        src={service.image}
                        alt={service.title || ""}
                        className="w-full h-40 object-cover rounded-2xl mb-4"
                      />
                    ) : (
                      <div className="text-4xl mb-4">{service.icon}</div>
                    ))}
                  <h3 className="text-xl font-bold text-[color:var(--agent-text)] mb-2">
                    {service.title || `Service ${i + 1}`}
                  </h3>
                  {service.description && (
                    <p className="text-[color:var(--agent-muted)] mb-4">{service.description}</p>
                  )}
                  {entryLines.length > 0 && (
                    <ul className="space-y-2">
                      {entryLines.map((entry, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-[color:var(--agent-muted)]">
                          <FaCheck className="shrink-0 text-[color:var(--agent-accent)]" /> {entry}
                        </li>
                      ))}
                    </ul>
                  )}
                  {(service.price || service.duration) && (
                    <p className="mt-4 text-sm font-semibold text-[color:var(--agent-accent-strong)]">
                      {[service.price, service.duration].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ServicesBlock({ template, ...data }) {
  if (template === "agent") {
    return <AgentServices {...data} />;
  }
  if (template === "handyman") {
    return <HandymanServices {...data} />;
  }
  return <HealthcareServices {...data} />;
}
