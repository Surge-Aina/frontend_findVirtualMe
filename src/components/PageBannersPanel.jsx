import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { FieldEditor } from "./PortfolioEditorFields";
import { ImageFieldEditor } from "./ImageFieldEditor";
import { SECTION_LABELS } from "./sectionNavLabels";
import { BLOCK_LABELS } from "./portfolioEditorConfig";

function normalizePageBanner(pb) {
  return pb && typeof pb === "object" ? pb : {};
}

export default function PageBannersPanel({ sections, onPatchPageBanner }) {
  const [expandedById, setExpandedById] = useState({});
  const bannerSections = (sections || []).filter((s) => s.type !== "seo");

  const toggleExpanded = (sectionId) => {
    setExpandedById((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  if (!bannerSections.length) {
    return (
      <div className="mt-4 lg:mt-0 bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-4">
        <h3 className="font-semibold text-gray-900 dark:text-neutral-100 text-sm">Page banners</h3>
        <p className="text-xs text-gray-500 dark:text-neutral-400 mt-2">
          Add content sections to configure an optional banner strip above each block.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 lg:mt-0 bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-neutral-100 text-sm">Page banners</h3>
        <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1 leading-relaxed">
          Enable a banner per section, set title copy, and choose a left-to-right gradient or a background image. Turning
          a banner off does not remove saved colors or image URLs.
        </p>
      </div>

      <div className="space-y-4">
        {bannerSections.map((section) => {
          const id = section._id;
          if (!id) return null;
          const pb = normalizePageBanner(section.data?.pageBanner);
          const navLabel = SECTION_LABELS[section.type] || section.type;
          const blockLabel = BLOCK_LABELS[section.type] || section.type;
          const enabled = pb.enabled === true;
          const bgMode = pb.bannerBackground === "image" ? "image" : "gradient";

          const setPb = (patch) => onPatchPageBanner(id, patch);

          const expanded = Boolean(expandedById[id]);

          return (
            <div
              key={id}
              className="rounded-lg border border-gray-200 dark:border-neutral-600 bg-gray-50/80 dark:bg-neutral-800/50 overflow-hidden"
            >
              <div className="flex items-center gap-2 p-3 min-h-[3rem]">
                <button
                  type="button"
                  onClick={() => toggleExpanded(id)}
                  className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700"
                  aria-expanded={expanded}
                  aria-label={expanded ? "Collapse banner details" : "Expand banner details"}
                  title={expanded ? "Collapse" : "Expand"}
                >
                  <FaChevronDown
                    className={`text-sm transition-transform ${expanded ? "rotate-180" : ""}`}
                  />
                </button>
                <label className="flex min-w-0 flex-1 items-center gap-2 text-sm font-medium text-gray-800 dark:text-neutral-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setPb({ enabled: e.target.checked })}
                    className="rounded border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 text-blue-600 focus:ring-blue-500 shrink-0"
                  />
                  <span className="truncate">{blockLabel}</span>
                </label>
              </div>

              {expanded ? (
              <div className="space-y-3 border-t border-gray-200/80 dark:border-neutral-600/80 px-3 pb-3 pt-3 sm:pl-10">
              <p className="text-xs text-gray-500 dark:text-neutral-400">
                Nav title defaults to &quot;{navLabel}&quot; unless you override below.
              </p>

              <div className="space-y-3 pl-0 sm:pl-0 border-t border-gray-200/80 dark:border-neutral-600/80 pt-3">
                <FieldEditor
                  label="Title (optional override)"
                  value={pb.title || ""}
                  onChange={(v) => setPb({ title: v })}
                />
                <FieldEditor
                  label="Subtitle"
                  value={pb.subtitle || ""}
                  onChange={(v) => setPb({ subtitle: v })}
                  type="textarea"
                  rows={2}
                  placeholder="Short line under the title"
                />

                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-neutral-300 mb-2">Banner background</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "gradient", label: "Color gradient" },
                      { value: "image", label: "Background image" },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPb({ bannerBackground: value })}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors ${
                          bgMode === value
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200"
                            : "border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {bgMode === "gradient" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">Gradient left (hex)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          className="h-10 w-14 rounded border border-gray-300 dark:border-neutral-600 cursor-pointer shrink-0"
                          value={
                            pb.gradientFrom && /^#[0-9A-Fa-f]{6}$/.test(pb.gradientFrom)
                              ? pb.gradientFrom
                              : "#1d4ed8"
                          }
                          onChange={(e) => setPb({ gradientFrom: e.target.value })}
                        />
                        <input
                          type="text"
                          className="flex-1 min-w-0 px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100"
                          placeholder="#1d4ed8"
                          value={pb.gradientFrom || ""}
                          onChange={(e) => setPb({ gradientFrom: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">Gradient right (hex)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          className="h-10 w-14 rounded border border-gray-300 dark:border-neutral-600 cursor-pointer shrink-0"
                          value={
                            pb.gradientTo && /^#[0-9A-Fa-f]{6}$/.test(pb.gradientTo) ? pb.gradientTo : "#1e3a8a"
                          }
                          onChange={(e) => setPb({ gradientTo: e.target.value })}
                        />
                        <input
                          type="text"
                          className="flex-1 min-w-0 px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100"
                          placeholder="#1e3a8a"
                          value={pb.gradientTo || ""}
                          onChange={(e) => setPb({ gradientTo: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <ImageFieldEditor
                    label="Background image (URL or upload)"
                    value={pb.backgroundImage || ""}
                    onChange={(v) => setPb({ backgroundImage: v })}
                    placeholder="https://... or /uploads/..."
                  />
                )}
              </div>
              </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
