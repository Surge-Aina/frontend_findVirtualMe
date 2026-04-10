import { useState } from "react";

function trimStr(s) {
  return typeof s === "string" ? s.trim() : "";
}

/** True when both before and after image URLs are set — use side-by-side comparison layout. */
export function galleryItemIsComparison(item) {
  const b = trimStr(item?.beforeImageUrl);
  const a = trimStr(item?.afterImageUrl);
  return Boolean(b && a);
}

/**
 * Primary image URL for a single-photo grid item (not comparison).
 * Prefers imageUrl / image; otherwise a lone before or after URL.
 */
export function galleryItemSingleImageUrl(item) {
  if (galleryItemIsComparison(item)) return null;
  return (
    trimStr(item?.imageUrl) ||
    trimStr(item?.image) ||
    trimStr(item?.beforeImageUrl) ||
    trimStr(item?.afterImageUrl) ||
    null
  );
}

function HealthcareGallery({ facilityImages = [], beforeAfterCases = [] }) {
  const [lightbox, setLightbox] = useState(null);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Gallery</h2>

        {facilityImages.length > 0 && (
          <>
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Our Facility</h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-16">
              {facilityImages.map((img, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => setLightbox(img)}
                >
                  <img src={img.url} alt={img.caption || ""} className="w-full h-64 object-cover" />
                  {img.caption && <p className="p-4 text-gray-700 font-medium">{img.caption}</p>}
                </div>
              ))}
            </div>
          </>
        )}

        {beforeAfterCases.length > 0 && (
          <>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Before & After</h3>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 text-yellow-700 text-sm">
              Results may vary. Consult with a professional.
            </div>
            <div className="space-y-10">
              {beforeAfterCases.map((c, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">{c.title}</h4>
                  {c.treatment && <p className="text-blue-600 mb-4">{c.treatment} {c.duration && `· ${c.duration}`}</p>}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-red-50 rounded-lg overflow-hidden">
                      <p className="text-center text-sm font-medium text-red-600 py-2">Before</p>
                      <img src={c.beforeImage} alt="Before" className="w-full h-64 object-cover" />
                    </div>
                    <div className="bg-green-50 rounded-lg overflow-hidden">
                      <p className="text-center text-sm font-medium text-green-600 py-2">After</p>
                      <img src={c.afterImage} alt="After" className="w-full h-64 object-cover" />
                    </div>
                  </div>
                  {c.description && <p className="text-gray-600 mt-4">{c.description}</p>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox.url} alt={lightbox.caption || ""} className="max-h-[80vh] max-w-full object-contain rounded-lg" />
        </div>
      )}
    </section>
  );
}

function HandymanGallery({ sectionTitle, sectionSubtitle, allLabel = "All", items = [] }) {
  const itemsWithVisual = Array.isArray(items)
    ? items.filter((item) => galleryItemIsComparison(item) || galleryItemSingleImageUrl(item))
    : [];
  const categories = [allLabel, ...new Set(itemsWithVisual.map((g) => g.category).filter(Boolean))];
  const [active, setActive] = useState(allLabel);

  const filtered =
    active === allLabel ? itemsWithVisual : itemsWithVisual.filter((g) => g.category === active);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {sectionTitle && <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">{sectionTitle}</h2>}
        {sectionSubtitle && <p className="text-center text-gray-600 mb-8">{sectionSubtitle}</p>}

        {categories.length > 1 && (
          <div className="flex flex-wrap gap-3 justify-center mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  active === cat ? "bg-amber-500 text-white" : "bg-white text-gray-700 hover:bg-amber-50 border border-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, i) => {
            const isCompare = galleryItemIsComparison(item);
            const singleUrl = galleryItemSingleImageUrl(item);
            if (!isCompare && !singleUrl) return null;
            return (
              <div key={item._id || i} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {isCompare ? (
                  <div className="grid grid-cols-2 h-56">
                    <div className="relative">
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Before</span>
                      <img src={item.beforeImageUrl} alt="Before" className="w-full h-full object-cover" />
                    </div>
                    <div className="relative">
                      <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">After</span>
                      <img src={item.afterImageUrl} alt="After" className="w-full h-full object-cover" />
                    </div>
                  </div>
                ) : (
                  <div className="h-56 bg-gray-100">
                    <img src={singleUrl} alt={item.title || ""} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  {item.category && <span className="text-sm text-amber-600">{item.category}</span>}
                  {item.subtitle && <p className="text-gray-600 text-sm mt-1">{item.subtitle}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AgentGallery({
  sectionTitle,
  sectionSubtitle,
  allLabel = "All",
  items = [],
  facilityImages = [],
  beforeAfterCases = [],
}) {
  const [active, setActive] = useState(allLabel);
  const itemsWithVisual = Array.isArray(items)
    ? items.filter((item) => galleryItemIsComparison(item) || galleryItemSingleImageUrl(item))
    : [];
  const hasHealthcareItems =
    (Array.isArray(facilityImages) && facilityImages.length > 0) ||
    (Array.isArray(beforeAfterCases) && beforeAfterCases.length > 0);

  if (!itemsWithVisual.length && !hasHealthcareItems) return null;

  const categories = itemsWithVisual.length
    ? [allLabel, ...new Set(items.map((g) => g.category).filter(Boolean))]
    : [];
  const filtered =
    active === allLabel ? itemsWithVisual : itemsWithVisual.filter((g) => g.category === active);

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="agent-panel rounded-[1.75rem] p-6 md:p-8">
          <h2 className="text-3xl font-bold text-[color:var(--agent-text)] mb-2">
            {sectionTitle || "Gallery"}
          </h2>
          {sectionSubtitle && (
            <p className="text-[color:var(--agent-muted)] mb-8">{sectionSubtitle}</p>
          )}

          {itemsWithVisual.length > 0 && categories.length > 1 && (
            <div className="flex flex-wrap gap-3 mb-8">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActive(cat)}
                  className="px-4 py-2 rounded-full text-sm font-medium border"
                  style={{
                    borderColor: "var(--agent-border)",
                    backgroundColor: active === cat ? "var(--agent-accent)" : "rgba(255,255,255,0.05)",
                    color: active === cat ? "#0f172a" : "var(--agent-text)",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {itemsWithVisual.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
              {filtered.map((item, i) => {
                const isCompare = galleryItemIsComparison(item);
                const singleUrl = galleryItemSingleImageUrl(item);
                if (!isCompare && !singleUrl) return null;
                return (
                  <div key={item._id || i} className="agent-panel-alt rounded-[1.5rem] overflow-hidden">
                    {isCompare ? (
                      <div className="grid grid-cols-2 h-56">
                        <div className="relative">
                          <span className="absolute top-2 left-2 text-white text-xs px-2 py-1 rounded bg-black/60">Before</span>
                          <img src={item.beforeImageUrl} alt="Before" className="w-full h-full object-cover" />
                        </div>
                        <div className="relative">
                          <span className="absolute top-2 left-2 text-white text-xs px-2 py-1 rounded bg-black/60">After</span>
                          <img src={item.afterImageUrl} alt="After" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-56 bg-black/20">
                        <img src={singleUrl} alt={item.title || ""} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-[color:var(--agent-text)]">{item.title}</h3>
                      {item.category && <span className="text-sm text-[color:var(--agent-accent)]">{item.category}</span>}
                      {item.subtitle && <p className="text-[color:var(--agent-muted)] text-sm mt-1">{item.subtitle}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {hasHealthcareItems && (
            <div className="space-y-8">
              {facilityImages.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {facilityImages.map((img, i) => (
                    <div key={i} className="agent-panel-alt rounded-[1.5rem] overflow-hidden">
                      <img src={img.url} alt={img.caption || ""} className="w-full h-64 object-cover" />
                      {img.caption && <p className="p-4 text-[color:var(--agent-muted)]">{img.caption}</p>}
                    </div>
                  ))}
                </div>
              )}
              {beforeAfterCases.length > 0 && (
                <div className="space-y-6">
                  {beforeAfterCases.map((c, i) => (
                    <div key={i} className="agent-panel-alt rounded-[1.5rem] p-6">
                      <h4 className="text-xl font-bold text-[color:var(--agent-text)] mb-1">{c.title}</h4>
                      {c.treatment && (
                        <p className="text-[color:var(--agent-accent)] mb-4">
                          {c.treatment} {c.duration && `· ${c.duration}`}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <img src={c.beforeImage} alt="Before" className="w-full h-64 object-cover rounded-2xl" />
                        <img src={c.afterImage} alt="After" className="w-full h-64 object-cover rounded-2xl" />
                      </div>
                      {c.description && <p className="text-[color:var(--agent-muted)] mt-4">{c.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function GalleryBlock({ template, ...data }) {
  if (template === "agent") {
    return <AgentGallery {...data} />;
  }
  if (template === "handyman") {
    return <HandymanGallery {...data} />;
  }
  return <HealthcareGallery {...data} />;
}