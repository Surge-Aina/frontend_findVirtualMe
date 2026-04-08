function looksLikeHttpUrl(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

/** YouTube watch/share URLs cannot be used as iframe src; convert to /embed/… */
function normalizeEmbedUrlForIframe(raw) {
  const s = String(raw || "").trim();
  if (!/^https?:\/\//i.test(s)) return "";

  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\./i, "").toLowerCase();

    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/").filter(Boolean)[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
      return s;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (u.pathname === "/watch" || u.pathname === "/watch/") {
        const v = u.searchParams.get("v");
        if (v) {
          const list = u.searchParams.get("list");
          let out = `https://www.youtube.com/embed/${v}`;
          if (list) out += `?list=${encodeURIComponent(list)}`;
          return out;
        }
      }
      if (u.pathname.startsWith("/embed/")) return s;
      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.replace(/^\/shorts\//, "").split("/").filter(Boolean)[0];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
      if (u.pathname.startsWith("/live/")) {
        const id = u.pathname.replace(/^\/live\//, "").split("/").filter(Boolean)[0];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
    }
  } catch {
    return s;
  }
  return s;
}

export default function VideoEmbedBlock({ template, ...data }) {
  const isAgent = template === "agent";
  const rawEmbed = looksLikeHttpUrl(data.embedUrl) ? data.embedUrl.trim() : "";
  const embedUrl = rawEmbed ? normalizeEmbedUrlForIframe(rawEmbed) : "";
  const videoUrl = looksLikeHttpUrl(data.videoUrl) ? data.videoUrl : "";
  const posterImageUrl = looksLikeHttpUrl(data.posterImageUrl) ? data.posterImageUrl : "";
  const shellClass = isAgent
    ? "agent-panel rounded-[1.75rem] p-6 md:p-8"
    : "max-w-5xl mx-auto rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm";
  const mediaFrameClass = isAgent
    ? "overflow-hidden rounded-[1.5rem] border border-[color:var(--agent-border)] bg-black/20"
    : "overflow-hidden rounded-[1.5rem] border border-gray-200 bg-black";

  return (
    <section className={isAgent ? "py-12" : "py-12 bg-white"}>
      <div className="mx-auto max-w-5xl px-4">
        <div className={shellClass}>
          <div className="mb-6">
            <p className={isAgent ? "text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--agent-muted)]" : "text-sm font-semibold uppercase tracking-[0.18em] text-gray-500"}>
              {data.sectionTitle || "Featured Video"}
            </p>
            <h2 className={isAgent ? "mt-2 text-3xl font-bold text-[color:var(--agent-text)]" : "mt-2 text-3xl font-bold text-gray-900"}>
              {data.title || "Add a featured reel, talk, or walkthrough"}
            </h2>
            {data.description && (
              <p className={isAgent ? "mt-2 text-[color:var(--agent-muted)]" : "mt-2 text-gray-600"}>
                {data.description}
              </p>
            )}
          </div>

          <div className={mediaFrameClass}>
            {embedUrl ? (
              <div className="aspect-video">
                <iframe
                  src={embedUrl}
                  title={data.title || "Embedded video"}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : videoUrl ? (
              <video
                controls
                className="aspect-video h-full w-full"
                src={videoUrl}
                poster={posterImageUrl || undefined}
              />
            ) : (
              <div className={isAgent ? "flex aspect-video items-center justify-center px-6 text-center text-[color:var(--agent-muted)]" : "flex aspect-video items-center justify-center px-6 text-center text-gray-500"}>
                Add an embed URL or hosted video URL to display media here.
              </div>
            )}
          </div>

          {(data.provider || (!embedUrl && !videoUrl)) && (
            <p className={isAgent ? "mt-3 text-sm text-[color:var(--agent-muted)]" : "mt-3 text-sm text-gray-500"}>
              {data.provider || "YouTube, Vimeo, Loom, or a hosted MP4 all work here."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
