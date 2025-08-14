// TaggedShowcase.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose } from "react-icons/md";

/* helpers */
const cx = (...c) => c.filter(Boolean).join(" ");
const isUnavailable = (mi) =>
  !!mi &&
  (mi.isAvailable === false ||
    (mi.unavailableUntil && new Date(mi.unavailableUntil) > new Date()));

/* pill tag badge (readable anywhere) */
function TagBadge({ label, price, unavailable, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium",
        "shadow-md ring-1 ring-black/10 backdrop-blur",
        unavailable
          ? "bg-red-600/85 text-white"
          : "bg-emerald-600/85 text-white"
      )}
      aria-label={`${label} ${unavailable ? "(Unavailable)" : "(Available)"}`}
    >
      <span className="h-2 w-2 rounded-full bg-white" />
      <span className="whitespace-nowrap">{label}</span>
      {price != null && price !== "" && (
        <span className="text-[11px] opacity-90">${price}</span>
      )}
    </button>
  );
}

export default function TaggedShowcase() {
  const [image, setImage] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedTagPosition, setSelectedTagPosition] = useState(null);

  // zoom / pan (unchanged core)
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, mx: 0, my: 0 });

  const imageContainerRef = useRef(null);
  const imgRef = useRef(null);
  const [baseSize, setBaseSize] = useState({ w: 0, h: 0 });

  /* data */
  useEffect(() => {
    API.get("/tagged")
      .then((res) => {
        const latest = res.data[res.data.length - 1];
        if (latest) {
          setImage(latest.imageUrl);
          setTags(latest.tags || []);
        }
      })
      .catch((err) => console.error("Error loading tagged image:", err));
  }, []);

  /* measure image size */
  const measureBase = useCallback(() => {
    const el = imgRef.current;
    if (!el) return;
    setBaseSize({ w: el.offsetWidth || 0, h: el.offsetHeight || 0 });
  }, []);
  useEffect(() => {
    const onR = () => measureBase();
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, [measureBase]);

  /* clamp so the image never leaves the frame */
  const clampPan = useCallback(
    (nextX, nextY) => {
      const container = imageContainerRef.current;
      if (!container || !baseSize.w || !baseSize.h)
        return { x: nextX, y: nextY };
      const W = baseSize.w * scale;
      const H = baseSize.h * scale;
      const CW = container.clientWidth;
      const CH = container.clientHeight;
      const minX = W <= CW ? (CW - W) / 2 : CW - W;
      const maxX = W <= CW ? (CW - W) / 2 : 0;
      const minY = H <= CH ? (CH - H) / 2 : CH - H;
      const maxY = H <= CH ? (CH - H) / 2 : 0;
      return {
        x: Math.min(maxX, Math.max(minX, nextX)),
        y: Math.min(maxY, Math.max(minY, nextY)),
      };
    },
    [baseSize.w, baseSize.h, scale]
  );

  /* wheel zoom (non-passive) */
  useEffect(() => {
    const el = imageContainerRef.current;
    if (!el || !zoomEnabled) return;
    const onWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const prev = scale;
      const next = Math.max(1, Math.min(3, prev - e.deltaY * 0.0015));
      if (next === prev) return;

      // zoom around cursor
      const worldX = (mx - pan.x) / prev;
      const worldY = (my - pan.y) / prev;
      const newX = mx - worldX * next;
      const newY = my - worldY * next;

      setScale(next);
      setPan(clampPan(newX, newY));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomEnabled, scale, pan, clampPan]);

  /* pan */
  const onPointerDown = (e) => {
    if (!zoomEnabled || scale === 1) return;
    e.preventDefault();
    setPanning(true);
    panStart.current = { x: pan.x, y: pan.y, mx: e.clientX, my: e.clientY };
  };
  const onPointerMove = (e) => {
    if (!panning) return;
    e.preventDefault();
    const dx = e.clientX - panStart.current.mx;
    const dy = e.clientY - panStart.current.my;
    setPan(clampPan(panStart.current.x + dx, panStart.current.y + dy));
  };
  const endPan = () => setPanning(false);

  /* focus tag from legend */
  const focusTag = (tag) => {
    const container = imageContainerRef.current;
    if (!container || !baseSize.w || !baseSize.h) return;
    const cx = container.clientWidth / 2;
    const cy = container.clientHeight / 2;
    const posX = tag.x * baseSize.w * scale + pan.x;
    const posY = tag.y * baseSize.h * scale + pan.y;
    const targetX = pan.x + (cx - posX);
    const targetY = pan.y + (cy - posY);
    setPan(clampPan(targetX, targetY));
    setSelectedItem(tag.menuItem);
    setSelectedTagPosition({ relX: tag.x, relY: tag.y });
  };

  /* ---------- NEW: popover placement + arrow geometry ---------- */
  const getBannerPlacement = () => {
    if (!selectedTagPosition || !imageContainerRef.current) {
      return { style: {}, arrowStyle: {} };
    }
    const container = imageContainerRef.current;
    const padding = 10;
    const W = 288; // card width
    const H = 200; // approximate height for arrow maths
    const offset = 12;

    const absX = selectedTagPosition.relX * baseSize.w * scale + pan.x;
    const absY = selectedTagPosition.relY * baseSize.h * scale + pan.y;

    let left = absX + offset;
    let top = absY + offset;
    let placeX = "left"; // arrow on left edge by default (card sits right of tag)
    let placeY = "top";

    if (left + W + padding > container.clientWidth) {
      left = absX - W - offset;
      placeX = "right"; // card is left of the tag → arrow on right edge
    }
    if (top + H + padding > container.clientHeight) {
      top = absY - H - offset;
      placeY = "bottom";
    }

    left = Math.max(
      padding,
      Math.min(left, container.clientWidth - W - padding)
    );
    top = Math.max(
      padding,
      Math.min(top, container.clientHeight - H - padding)
    );

    // Arrow inside the card, near where the tag is
    const localY = Math.min(H - 18, Math.max(18, absY - top));
    const arrowStyle =
      placeX === "left"
        ? { left: -6, top: localY, transform: "rotate(45deg)" }
        : { right: -6, top: localY, transform: "rotate(45deg)" };

    return { style: { left, top }, arrowStyle };
  };

  const placement = getBannerPlacement();

  return (
    <section id="showcase" className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">
        Explore Our Showcase
      </h2>

      {!image ? (
        <p className="text-center text-gray-500">
          No showcase image available.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-[1fr_280px]">
          {/* Canvas */}
          <div
            ref={imageContainerRef}
            className={cx(
              "relative overflow-hidden rounded-xl  shadow bg-white",
              zoomEnabled && scale > 1
                ? panning
                  ? "cursor-grabbing"
                  : "cursor-grab"
                : "cursor-default"
            )}
            style={{ touchAction: zoomEnabled ? "none" : "auto" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endPan}
            onPointerLeave={endPan}
          >
            <div
              className="relative"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                transformOrigin: "0 0",
              }}
            >
              <img
                ref={imgRef}
                src={`${import.meta.env.VITE_BAKEND_API}${image}`}
                alt="Product Showcase"
                className="block w-full select-none"
                onLoad={measureBase}
                draggable={false}
              />

              {tags.map((tag, idx) => {
                const unavailable = isUnavailable(tag.menuItem);
                return (
                  <div
                    key={idx}
                    className="absolute"
                    style={{
                      left: `${tag.x * 100}%`,
                      top: `${tag.y * 100}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <TagBadge
                      label={tag.menuItem?.name || tag.label}
                      price={tag.menuItem?.price}
                      unavailable={unavailable}
                      onClick={() => {
                        setSelectedItem(tag.menuItem);
                        setSelectedTagPosition({ relX: tag.x, relY: tag.y });
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Popover (restyled) */}
            <AnimatePresence>
              {selectedItem && selectedTagPosition && (
                <motion.div
                  key="tag-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className="absolute z-50 w-72 max-w-full rounded-xl bg-white p-4 shadow-xl ring-1 ring-black/10"
                  style={placement.style}
                >
                  {/* arrow */}
                  <span
                    className="pointer-events-none absolute h-3 w-3 bg-white shadow ring-1 ring-black/10"
                    style={placement.arrowStyle}
                  />

                  {/* Header */}
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cx(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                            selectedItem.isAvailable
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          )}
                        >
                          <span
                            className={cx(
                              "h-[6px] w-[6px] rounded-full",
                              selectedItem.isAvailable
                                ? "bg-emerald-600"
                                : "bg-red-600"
                            )}
                          />
                          {selectedItem.isAvailable
                            ? "Available"
                            : selectedItem.unavailableUntil
                            ? `Unavailable until ${new Date(
                                selectedItem.unavailableUntil
                              ).toLocaleDateString()}`
                            : "Unavailable"}
                        </span>
                      </div>
                      <h3 className="mt-1 truncate text-sm font-semibold">
                        {selectedItem.name}
                      </h3>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-800">
                        ${selectedItem.price}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedItem(null);
                          setSelectedTagPosition(null);
                        }}
                        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                        aria-label="Close"
                      >
                        <MdClose className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {selectedItem.image && (
                    <img
                      src={`${import.meta.env.VITE_BAKEND_API}${
                        selectedItem.image
                      }`}
                      alt={selectedItem.name}
                      className="mb-2 h-32 w-full rounded-lg object-cover"
                    />
                  )}

                  <p className="text-sm text-gray-700">
                    {selectedItem.description || "No description"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right legend + zoom toggle (unchanged) */}
          <aside className="md:sticky md:top-20">
            <div className="rounded-xl bg-white p-3 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold">Tagged items</div>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={zoomEnabled}
                    onChange={() => {
                      if (zoomEnabled) {
                        setScale(1);
                        setPan({ x: 0, y: 0 });
                      }
                      setZoomEnabled((v) => !v);
                    }}
                  />
                  Zoom image
                </label>
              </div>

              <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
                {tags.map((t, idx) => {
                  const item = t.menuItem || {};
                  const unavailable = isUnavailable(item);
                  return (
                    <button
                      key={`legend-${idx}`}
                      onClick={() => focusTag(t)}
                      className={cx(
                        "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition",
                        "hover:bg-gray-50",
                        unavailable ? "border-red-200" : "border-emerald-200"
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className={cx(
                            "h-2.5 w-2.5 flex-shrink-0 rounded-full",
                            unavailable ? "bg-red-500" : "bg-emerald-600"
                          )}
                        />
                        <span className="truncate">
                          {item.name || t.label || "Item"}
                        </span>
                      </span>
                      <span className="ml-2 text-xs font-medium text-gray-600">
                        {item.price ? `$${item.price}` : ""}
                      </span>
                    </button>
                  );
                })}
                {!tags?.length && (
                  <div className="text-xs text-gray-500">No tags yet.</div>
                )}
              </div>

              <p className="mt-3 text-[11px] text-gray-500">
                {zoomEnabled
                  ? "Scroll to zoom the image. Drag to pan."
                  : "Enable “Zoom image” to scroll-zoom & pan the photo."}
              </p>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
