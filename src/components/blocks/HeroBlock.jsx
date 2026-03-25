import { FaPhone } from "react-icons/fa";

const healthcareVariant = (data) => (
  <section
    className="relative bg-gradient-to-br from-blue-700 to-blue-900 text-white pt-30 pb-20"
    style={
      data.backgroundImage
        ? { backgroundImage: `url(${data.backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
        : undefined
    }
  >
    {data.backgroundImage && <div className="absolute inset-0 bg-black/40" />}
    <div className="relative max-w-7xl mx-auto px-4 text-center">
      {data.logoImage && (
        <img src={data.logoImage} alt="" className="h-20 mx-auto mb-6 object-contain" />
      )}
      <h1 className="text-4xl md:text-6xl font-bold mb-4">{data.practiceName}</h1>
      {data.tagline && <p className="text-xl md:text-2xl mb-4 text-blue-100">{data.tagline}</p>}
      {data.description && <p className="text-lg max-w-2xl mx-auto mb-8 text-blue-100">{data.description}</p>}
      <div className="flex flex-wrap gap-4 justify-center">
        {data.primaryButtonText && (
          <a href="#contact" className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-transform">
            {data.primaryButtonText}
          </a>
        )}
        {data.secondaryButtonText && (
          <a href="#services" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
            {data.secondaryButtonText}
          </a>
        )}
      </div>
    </div>
  </section>
);

const handymanVariant = (data) => (
  <section className="bg-gradient-to-br from-amber-50 to-white py-16 md:py-24">
    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
      <div className="flex-1 space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">{data.title}</h1>
        {data.subtitle && <p className="text-lg text-gray-600">{data.subtitle}</p>}
        {(data.badge1Text || data.badge2Text || data.badge3Text) && (
          <ul className="flex flex-wrap gap-3">
            {[data.badge1Text, data.badge2Text, data.badge3Text].filter(Boolean).map((badge, i) => (
              <li key={i} className="bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-sm font-medium">
                {badge}
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-4 pt-2">
          {data.ctaText && (
            <a href="#contact" className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              {data.ctaText}
            </a>
          )}
          {data.phoneNumber && (
            <a href={`tel:${data.phoneNumber}`} className="flex items-center gap-2 border-2 border-gray-300 px-6 py-3 rounded-lg text-gray-700 hover:border-amber-500 transition-colors">
              <FaPhone className="text-amber-500" /> {data.phoneNumber}
            </a>
          )}
        </div>
      </div>
      {data.imageUrl && (
        <div className="flex-1 max-w-md">
          <img src={data.imageUrl} alt="" className="w-full rounded-2xl shadow-xl object-cover" />
        </div>
      )}
    </div>
  </section>
);

const projectManagerVariant = (data) => (
  <section className="bg-slate-800 text-white py-16">
    <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
      {data.profileImage && (
        <img src={data.profileImage} alt="" className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-blue-500 shadow-lg" />
      )}
      <h1 className="text-4xl font-bold">{data.name}</h1>
      {data.title && <p className="text-xl text-blue-300">{data.title}</p>}
      {data.bio && <p className="text-slate-300 max-w-2xl mx-auto">{data.bio}</p>}
    </div>
  </section>
);

const agentVariant = (data) => {
  const title = data.title || data.practiceName || data.name || "Your custom portfolio";
  const subtitle = data.subtitle || data.tagline || data.summary || data.bio || "";
  const description = data.description || data.about || "";
  const image = data.imageUrl || data.profileImage || data.logoImage || "";
  const primaryText = data.ctaText || data.primaryButtonText || "Get in touch";
  const secondaryText = data.secondaryButtonText || "Explore work";
  const phone = data.phoneNumber || data.phone || "";
  const badges = [data.badge1Text, data.badge2Text, data.badge3Text].filter(Boolean);

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="agent-panel rounded-[1.75rem] overflow-hidden">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] px-6 py-8 md:px-10 md:py-12 items-center">
            <div className="space-y-6">
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge, index) => (
                    <span
                      key={`${badge}-${index}`}
                      className="px-3 py-1 rounded-full text-xs font-semibold border border-[color:var(--agent-border)] text-[color:var(--agent-muted)] bg-white/5"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
              <div className="space-y-3">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[color:var(--agent-text)]">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-lg md:text-xl text-[color:var(--agent-muted)] max-w-2xl">
                    {subtitle}
                  </p>
                )}
                {description && (
                  <p className="text-base md:text-lg text-[color:var(--agent-muted)]/90 max-w-2xl">
                    {description}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-4">
                {primaryText && (
                  <a
                    href="#contact"
                    className="px-6 py-3 rounded-full font-semibold text-slate-950 transition-transform hover:-translate-y-0.5"
                    style={{ backgroundColor: "var(--agent-accent)" }}
                  >
                    {primaryText}
                  </a>
                )}
                {secondaryText && (
                  <a
                    href="#projects"
                    className="px-6 py-3 rounded-full font-semibold border transition-colors text-[color:var(--agent-text)]"
                    style={{ borderColor: "var(--agent-border)" }}
                  >
                    {secondaryText}
                  </a>
                )}
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="flex items-center gap-2 px-6 py-3 rounded-full border text-[color:var(--agent-muted)]"
                    style={{ borderColor: "var(--agent-border)" }}
                  >
                    <FaPhone style={{ color: "var(--agent-accent-strong)" }} /> {phone}
                  </a>
                )}
              </div>
            </div>
            <div>
              <div className="agent-panel-alt rounded-[1.5rem] p-4 md:p-6">
                {image ? (
                  <img
                    src={image}
                    alt=""
                    className="w-full aspect-[4/3] rounded-[1.25rem] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[4/3] rounded-[1.25rem] border border-dashed border-[color:var(--agent-border)] flex items-center justify-center text-center px-6 text-sm text-[color:var(--agent-muted)]">
                    Add an image, logo, or profile photo to personalize this hero section.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function HeroBlock({ template, ...data }) {
  switch (template) {
    case "agent":
      return agentVariant(data);
    case "handyman":
      return handymanVariant(data);
    case "projectManager":
      return projectManagerVariant(data);
    case "healthcare":
    default:
      return healthcareVariant(data);
  }
}
