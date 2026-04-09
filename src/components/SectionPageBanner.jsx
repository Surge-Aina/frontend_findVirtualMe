import { SECTION_LABELS } from "./sectionNavLabels";

const TEMPLATE_BANNER_GRADIENT = {
  healthcare: { from: "#1d4ed8", to: "#1e3a8a" },
  handyman: { from: "#b45309", to: "#78350f" },
  projectManager: { from: "#1e293b", to: "#0f172a" },
  dataScientist: { from: "#0f172a", to: "#020617" },
  agent: { from: "#1e293b", to: "#0f172a" },
};

function defaultGradientForTemplate(template) {
  return TEMPLATE_BANNER_GRADIENT[template] || TEMPLATE_BANNER_GRADIENT.healthcare;
}

function resolveImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  const t = url.trim();
  if (!t) return "";
  if (t.startsWith("http://") || t.startsWith("https://") || t.startsWith("data:")) return t;
  const base = import.meta.env.VITE_BACKEND_API || "";
  if (t.startsWith("/")) return `${base}${t}`;
  return `${base}/${t}`;
}

/**
 * Legacy-style strip: gradient (or image + overlay), centered title + optional subtitle.
 */
export default function SectionPageBanner({
  template = "healthcare",
  sectionType,
  pageBanner = {},
  pageBannerDefaults = {},
}) {
  const navLabel = SECTION_LABELS[sectionType] || sectionType;
  const title = (pageBanner.title && String(pageBanner.title).trim()) || navLabel;
  const subtitle = pageBanner.subtitle != null ? String(pageBanner.subtitle).trim() : "";

  const def = defaultGradientForTemplate(template);
  const gradientFrom =
    pageBanner.gradientFrom ||
    pageBannerDefaults.gradientFrom ||
    def.from;
  const gradientTo =
    pageBanner.gradientTo ||
    pageBannerDefaults.gradientTo ||
    def.to;

  const sectionBg =
    (pageBanner.backgroundImage && String(pageBanner.backgroundImage).trim()) ||
    (pageBannerDefaults.backgroundImage && String(pageBannerDefaults.backgroundImage).trim()) ||
    "";
  const resolvedBg = resolveImageUrl(sectionBg);

  const bgMode = pageBanner.bannerBackground;
  const useImageBackground =
    bgMode === "image" || (bgMode !== "gradient" && resolvedBg);

  const gradientOverlayStyle = (() => {
    const a = "e6";
    const from =
      typeof gradientFrom === "string" && gradientFrom.startsWith("#") && gradientFrom.length === 7
        ? `${gradientFrom}${a}`
        : gradientFrom;
    const to =
      typeof gradientTo === "string" && gradientTo.startsWith("#") && gradientTo.length === 7
        ? `${gradientTo}${a}`
        : gradientTo;
    return { background: `linear-gradient(to bottom right, ${from}, ${to})` };
  })();

  return (
    <section className="relative text-white pt-12 pb-14 md:pt-14 md:pb-16 overflow-hidden" aria-label={title}>
      {useImageBackground ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={
              resolvedBg
                ? { backgroundImage: `url(${resolvedBg})` }
                : { background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})` }
            }
            aria-hidden
          />
          {resolvedBg ? (
            <div className="absolute inset-0 pointer-events-none" style={gradientOverlayStyle} aria-hidden />
          ) : null}
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})` }}
          aria-hidden
        />
      )}
      <div className="relative max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">{title}</h1>
        {subtitle ? (
          <p className="text-lg md:text-xl lg:text-2xl opacity-95 max-w-3xl mx-auto">{subtitle}</p>
        ) : null}
      </div>
    </section>
  );
}
