import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileAlt } from "react-icons/fa";
import { usePortfolioView } from "../context/PortfolioViewContext";

function SocialRow({ socialLinks, variant = "pm" }) {
  if (!socialLinks) return null;
  const { github, linkedin, twitter, instagram, website } = socialLinks;
  const entries = [
    { key: "github", label: "GitHub", url: github },
    { key: "linkedin", label: "LinkedIn", url: linkedin },
    { key: "twitter", label: "Twitter", url: twitter },
    { key: "instagram", label: "Instagram", url: instagram },
    { key: "website", label: "Website", url: website },
  ].filter((e) => e.url && String(e.url).trim());

  if (entries.length === 0) return null;

  const href = (u) => (/^https?:\/\//i.test(u) ? u : `https://${u}`);
  const linkClass =
    variant === "ds"
      ? "text-emerald-400/90 hover:text-emerald-300 text-sm underline underline-offset-2"
      : variant === "agent"
        ? "text-[color:var(--agent-accent)] hover:opacity-80 text-sm underline underline-offset-2"
      : "text-blue-300 hover:text-blue-200 text-sm underline";

  return (
    <div className="mt-6 border-t border-white/10 pt-6">
      <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Connect</h3>
      <div className="flex flex-wrap gap-4 justify-center md:justify-start">
        {entries.map(({ key, label, url }) => (
          <a
            key={key}
            href={href(url)}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}

export default function SummaryBlock({ template, ...data }) {
  const ctx = usePortfolioView();
  const isAgent = template === "agent";
  const isPM = template === "projectManager" || template === "dataScientist" || isAgent;
  const isDS = template === "dataScientist";
  const displayName = data.name || (isPM ? "Your name" : "");
  const displayTitle = data.title || (isPM ? "Your professional title" : "");
  const showPlaceholderHint = isPM && !data.name && !data.title && !data.bio && !data.summary;
  const socialLinks = isPM && ctx?.socialLinks ? ctx.socialLinks : null;

  if (isDS) {
    return (
      <section className="py-12 bg-transparent">
        <div className="max-w-3xl mx-auto px-4">
          <div className="ds-terminal-window">
            <div className="ds-terminal-titlebar">
              <span className="ds-terminal-dot ds-terminal-dot--red" aria-hidden />
              <span className="ds-terminal-dot ds-terminal-dot--yellow" aria-hidden />
              <span className="ds-terminal-dot ds-terminal-dot--green" aria-hidden />
              <span className="ds-terminal-title">portfolio — bash — 80×24</span>
            </div>
            <div className="ds-terminal-body">
              {showPlaceholderHint && (
                <p className="text-[var(--ds-text-muted)] text-xs mb-4 border border-dashed border-[var(--ds-border)] rounded-lg px-3 py-2 font-mono">
                  <span className="text-[var(--ds-accent)]">#</span> Run <strong className="text-[var(--ds-text)]">Edit</strong> to fill your profile.
                </p>
              )}
              {data.profileImage && (
                <div className="mb-6 flex justify-center md:justify-start">
                  <img
                    src={data.profileImage}
                    alt=""
                    className="w-24 h-24 rounded-md object-cover border-2 border-[var(--ds-accent)]/60 shadow-[0_0_20px_var(--ds-accent-glow)]"
                  />
                </div>
              )}
              <div className="ds-prompt-line font-mono text-sm">
                <span className="text-emerald-400">visitor@portfolio</span>
                <span className="text-[var(--ds-dim)]">:</span>
                <span className="text-[var(--ds-command)]">~</span>
                <span className="text-[var(--ds-text-muted)]">$</span>{" "}
                <span className="text-[var(--ds-text-muted)]">whoami</span>
              </div>
              <h2
                className={`text-2xl font-bold font-mono tracking-tight mb-1 ${
                  data.name ? "text-[var(--ds-text)]" : "text-[var(--ds-dim)] italic"
                }`}
              >
                {displayName}
              </h2>
              <p
                className={`text-sm font-mono mb-6 ${
                  data.title ? "text-[var(--ds-prompt)]" : "text-[var(--ds-dim)] italic"
                }`}
              >
                {displayTitle}
              </p>

              <div className="ds-prompt-line font-mono text-sm">
                <span className="text-emerald-400">visitor@portfolio</span>
                <span className="text-[var(--ds-dim)]">:</span>
                <span className="text-[var(--ds-command)]">~</span>
                <span className="text-[var(--ds-text-muted)]">$</span>{" "}
                <span className="text-[var(--ds-text-muted)]">cat ./about.txt</span>
              </div>
              <p
                className={`text-sm leading-relaxed font-mono border-l-2 border-[var(--ds-accent)]/50 pl-3 mb-6 ${
                  data.bio ? "text-[var(--ds-text-muted)]" : "text-[var(--ds-dim)] italic"
                }`}
              >
                {data.bio || "Tell visitors who you are — ML, analytics, experiments, and impact."}
              </p>

              {(data.summary || isPM) && (
                <>
                  <div className="ds-prompt-line font-mono text-sm">
                    <span className="text-emerald-400">visitor@portfolio</span>
                    <span className="text-[var(--ds-dim)]">:</span>
                    <span className="text-[var(--ds-command)]">~</span>
                    <span className="text-[var(--ds-text-muted)]">$</span>{" "}
                    <span className="text-[var(--ds-text-muted)]">head -n 5 ./summary.md</span>
                  </div>
                  <p className={`text-sm font-mono text-[var(--ds-text-muted)] mb-6`}>
                    {data.summary ||
                      "Short professional summary — stack, domains, and what you’re building toward."}
                  </p>
                </>
              )}

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-mono border-t border-[var(--ds-border-subtle)] pt-4">
                <span className="text-[var(--ds-dim)]">--contact--</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm font-mono">
                {(data.email || isPM) && (
                  <a
                    href={data.email ? `mailto:${data.email}` : undefined}
                    className={`flex items-center gap-2 ${
                      data.email ? "text-emerald-400/90 hover:text-emerald-300" : "text-[var(--ds-dim)] italic pointer-events-none"
                    }`}
                  >
                    <FaEnvelope /> {data.email || "you@email.com"}
                  </a>
                )}
                {(data.phone || isPM) && (
                  <a
                    href={data.phone ? `tel:${data.phone}` : undefined}
                    className={`flex items-center gap-2 ${
                      data.phone ? "text-emerald-400/90 hover:text-emerald-300" : "text-[var(--ds-dim)] italic pointer-events-none"
                    }`}
                  >
                    <FaPhone /> {data.phone || "+1 (555) 000-0000"}
                  </a>
                )}
                {(data.location || isPM) && (
                  <span className="flex items-center gap-2 text-[var(--ds-text-muted)]">
                    <FaMapMarkerAlt className="text-[var(--ds-accent)]" />{" "}
                    {data.location || "City, Country"}
                  </span>
                )}
                {data.resumeUrl && (
                  <a
                    href={data.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-emerald-400/90 hover:text-emerald-300"
                  >
                    <FaFileAlt /> Resume
                  </a>
                )}
              </div>
              {isPM && <SocialRow socialLinks={socialLinks} variant="ds" />}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isAgent) {
    return (
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="agent-panel rounded-[1.75rem] p-8 md:p-10">
            {showPlaceholderHint && (
              <p className="text-sm mb-5 border border-dashed rounded-xl px-4 py-3 text-[color:var(--agent-muted)] border-[color:var(--agent-border)]">
                This custom portfolio is ready for agent-composed content. Use <strong className="text-[color:var(--agent-text)]">Edit</strong> to shape the story.
              </p>
            )}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {data.profileImage && (
                <img
                  src={data.profileImage}
                  alt={data.name}
                  className="w-28 h-28 rounded-[1.25rem] object-cover border-4 shadow-lg"
                  style={{ borderColor: "var(--agent-accent)" }}
                />
              )}
              <div className="flex-1 text-center md:text-left">
                {displayName && (
                  <h2
                    className={`text-3xl font-bold tracking-tight ${
                      data.name ? "text-[color:var(--agent-text)]" : "text-[color:var(--agent-muted)] italic"
                    }`}
                  >
                    {displayName}
                  </h2>
                )}
                {displayTitle && (
                  <p
                    className={`text-lg mt-1 ${
                      data.title ? "text-[color:var(--agent-accent)]" : "text-[color:var(--agent-muted)] italic"
                    }`}
                  >
                    {displayTitle}
                  </p>
                )}
                {(data.location || (isPM && !data.location)) && (
                  <p className="text-sm flex items-center gap-1 justify-center md:justify-start mt-2 text-[color:var(--agent-muted)]">
                    <FaMapMarkerAlt /> {data.location || "City, Country"}
                  </p>
                )}
              </div>
            </div>

            {(data.bio || (isPM && !data.bio)) && (
              <div className="mt-6 border-t pt-6 border-[color:var(--agent-border)]">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] mb-2 text-[color:var(--agent-muted)]">
                  About
                </h3>
                <p className={data.bio ? "text-[color:var(--agent-text)]/90" : "text-[color:var(--agent-muted)] italic"}>
                  {data.bio || "Tell visitors who you are and what kind of work this custom portfolio represents."}
                </p>
              </div>
            )}

            {(data.summary || (isPM && !data.summary)) && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] mb-2 text-[color:var(--agent-muted)]">
                  Summary
                </h3>
                <p className={data.summary ? "text-[color:var(--agent-text)]/90" : "text-[color:var(--agent-muted)] italic"}>
                  {data.summary || "Add a short summary of your offer, craft, or professional focus."}
                </p>
              </div>
            )}

            <div className="mt-6 border-t pt-6 flex flex-wrap gap-4 text-sm border-[color:var(--agent-border)] text-[color:var(--agent-text)]">
              {(data.email || (isPM && !data.email)) && (
                <a
                  href={data.email ? `mailto:${data.email}` : undefined}
                  className={`flex items-center gap-2 ${data.email ? "hover:opacity-80" : "text-[color:var(--agent-muted)] italic pointer-events-none"}`}
                >
                  <FaEnvelope /> {data.email || "you@email.com"}
                </a>
              )}
              {(data.phone || (isPM && !data.phone)) && (
                <a
                  href={data.phone ? `tel:${data.phone}` : undefined}
                  className={`flex items-center gap-2 ${data.phone ? "hover:opacity-80" : "text-[color:var(--agent-muted)] italic pointer-events-none"}`}
                >
                  <FaPhone /> {data.phone || "+1 (555) 000-0000"}
                </a>
              )}
              {data.resumeUrl && (
                <a
                  href={data.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:opacity-80"
                >
                  <FaFileAlt /> Resume
                </a>
              )}
            </div>

            {isPM && <SocialRow socialLinks={socialLinks} variant="agent" />}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-slate-800">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-slate-700/50 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg p-8">
          {showPlaceholderHint && (
            <p className="text-slate-400 text-sm mb-4 border border-dashed border-white/20 rounded-lg px-3 py-2">
              This is your new portfolio. Use <strong className="text-slate-200">Edit</strong> to add your story, or
              fill these sections from your dashboard.
            </p>
          )}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {data.profileImage && (
              <img
                src={data.profileImage}
                alt={data.name}
                className={`w-28 h-28 rounded-full object-cover border-4 shadow-lg ${
                  template === "dataScientist" ? "border-emerald-500" : "border-blue-500"
                }`}
              />
            )}
            <div className="flex-1 text-center md:text-left">
              {displayName && (
                <h2 className={`text-2xl font-bold ${data.name ? "text-white" : "text-slate-500 italic"}`}>
                  {displayName}
                </h2>
              )}
              {displayTitle && (
                <p
                  className={`text-lg ${
                    data.title
                      ? template === "dataScientist"
                        ? "text-emerald-300/90"
                        : "text-blue-300"
                      : "text-slate-500 italic"
                  }`}
                >
                  {displayTitle}
                </p>
              )}
              {(data.location || (isPM && !data.location)) && (
                <p className="text-slate-400 text-sm flex items-center gap-1 justify-center md:justify-start mt-1">
                  <FaMapMarkerAlt /> {data.location || (isPM ? "City, Country" : "")}
                </p>
              )}
            </div>
          </div>

          {(data.bio || (isPM && !data.bio)) && (
            <div className="mt-6 border-t border-white/10 pt-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase mb-2">About</h3>
              <p className={data.bio ? "text-slate-300" : "text-slate-500 italic"}>
                {data.bio || (isPM ? "Tell visitors who you are and what you do." : "")}
              </p>
            </div>
          )}

          {(data.summary || (isPM && !data.summary)) && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase mb-2">Summary</h3>
              <p className={data.summary ? "text-slate-300" : "text-slate-500 italic"}>
                {data.summary || (isPM ? "Add a short professional summary — your goals, focus areas, and impact." : "")}
              </p>
            </div>
          )}

          <div className="mt-6 border-t border-white/10 pt-6 flex flex-wrap gap-4 text-sm text-slate-300">
            {(data.email || (isPM && !data.email)) && (
              <a
                href={data.email ? `mailto:${data.email}` : undefined}
                className={`flex items-center gap-2 ${data.email ? "hover:text-blue-400" : "text-slate-500 italic pointer-events-none"}`}
              >
                <FaEnvelope /> {data.email || "you@email.com"}
              </a>
            )}
            {(data.phone || (isPM && !data.phone)) && (
              <a
                href={data.phone ? `tel:${data.phone}` : undefined}
                className={`flex items-center gap-2 ${data.phone ? "hover:text-blue-400" : "text-slate-500 italic pointer-events-none"}`}
              >
                <FaPhone /> {data.phone || "+1 (555) 000-0000"}
              </a>
            )}
            {data.resumeUrl && (
              <a href={data.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-400">
                <FaFileAlt /> Resume
              </a>
            )}
          </div>

          {isPM && <SocialRow socialLinks={socialLinks} />}
        </div>
      </div>
    </section>
  );
}
