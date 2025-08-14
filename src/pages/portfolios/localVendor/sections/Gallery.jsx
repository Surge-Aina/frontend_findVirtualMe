import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import API from "../services/api";
import { isAdminLoggedIn } from "../services/auth";
import FileUploader from "../components/FileUploader";
import { toast } from "react-toastify";

const cx = (...c) => c.filter(Boolean).join(" ");

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({ image: null, caption: "" });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [current, setCurrent] = useState(0);
  const [isFs, setIsFs] = useState(false);
  const [loading, setLoading] = useState(true);

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, mx: 0, my: 0 });

  const stageRef = useRef(null);
  const imgRef = useRef(null);
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    API.get("/gallery")
      .then((res) => setImages(res.data || []))
      .catch((err) => console.error("Error fetching gallery:", err));
  }, []);

  const handleSubmit = () => {
    if (
      formData.image instanceof File &&
      formData.image.size > 2 * 1024 * 1024
    ) {
      toast.error("Please upload a valid image under 2MB");
      return;
    }
    const payload = new FormData();
    if (formData.image) payload.append("image", formData.image);
    payload.append("caption", formData.caption);

    const req = editingId
      ? API.put(`/gallery/${editingId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      : API.post("/gallery", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });

    req
      .then(() => {
        return API.get("/gallery").then((res) => setImages(res.data || []));
      })
      .then(() => {
        setFormData({ image: null, caption: "" });
        setEditingId(null);
        setShowForm(false);
      })
      .catch((err) => console.error("Save failed:", err));
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({ caption: item.caption || "", image: null });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure?")) {
      API.delete(`/gallery/${id}`)
        .then(() =>
          API.get("/gallery").then((res) => setImages(res.data || []))
        )
        .catch((err) => console.error("Delete failed:", err));
    }
  };

  const galleryItems = useMemo(
    () =>
      images.map((img) => ({
        original: `${baseUrl}${img.imageUrl}`,
        thumbnail: `${baseUrl}${img.imageUrl}`,
        originalAlt: img.caption || "Gallery image",
        thumbnailAlt: img.caption || "Gallery thumbnail",
        caption: img.caption || "",
      })),
    [images, baseUrl]
  );

  // preload neighbours
  useEffect(() => {
    const preload = (i) => {
      if (i < 0 || i >= galleryItems.length) return;
      const im = new Image();
      im.src = galleryItems[i].original;
    };
    preload(current + 1);
    preload(current - 1);
  }, [current, galleryItems]);

  // blur-up: decode current
  const decodeCurrent = useCallback(async () => {
    try {
      setLoading(true);
      const url = galleryItems[current]?.original;
      if (!url) return setLoading(false);
      const im = new Image();
      im.src = url;
      if (im.decode) await im.decode();
      else await new Promise((r) => (im.onload = r));
    } catch {}
    setLoading(false);
  }, [current, galleryItems]);

  useEffect(() => {
    decodeCurrent();
  }, [decodeCurrent]);

  // zoom/pan helpers (fullscreen only)
  const resetZoom = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
    setPanning(false);
  };

  const clampPan = (x, y) => {
    const stage = stageRef.current;
    const img = imgRef.current;
    if (!stage || !img) return { x, y };

    const CW = stage.clientWidth;
    const CH = stage.clientHeight;
    const dispW = img.clientWidth * scale;
    const dispH = img.clientHeight * scale;

    const minX = dispW <= CW ? (CW - dispW) / 2 : CW - dispW;
    const maxX = dispW <= CW ? (CW - dispW) / 2 : 0;
    const minY = dispH <= CH ? (CH - dispH) / 2 : CH - dispH;
    const maxY = dispH <= CH ? (CH - dispH) / 2 : 0;

    return {
      x: Math.min(maxX, Math.max(minX, x)),
      y: Math.min(maxY, Math.max(minY, y)),
    };
  };

  const onWheel = (e) => {
    if (!isFs) return;
    e.preventDefault();
    e.stopPropagation();
    const stage = stageRef.current;
    if (!stage) return;

    const rect = stage.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const prev = scale;
    const next = Math.max(1, Math.min(3, prev - e.deltaY * 0.0015));
    if (next === prev) return;

    const worldX = (mx - pan.x) / prev;
    const worldY = (my - pan.y) / prev;
    const newX = mx - worldX * next;
    const newY = my - worldY * next;

    setScale(next);
    setPan(clampPan(newX, newY));
  };

  const onPointerDown = (e) => {
    if (!isFs || scale === 1) return;
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
  const onDoubleClick = () => {
    if (!isFs) return;
    setScale((s) => (s === 1 ? 2 : 1));
    if (scale !== 1) resetZoom();
  };

  const onKeyDown = (e) => {
    if (e.key === " " && isFs) {
      e.preventDefault();
      onDoubleClick();
    }
  };

  const renderItem = (item) => {
    const label = `Slide ${current + 1} of ${galleryItems.length}${item.originalAlt ? ` — ${item.originalAlt}` : ""}`;
    return (
      <div
        role="group"
        aria-label={label}
        className={cx(
          "relative mx-auto w-full max-w-5xl select-none outline-none",
          // letterbox now WHITE to match site
          "bg-white rounded-xl overflow-hidden",
          "shadow-[inset_0_0_40px_rgba(0,0,0,.04)]"
        )}
      >
        <div
          ref={stageRef}
          className={cx(
            "relative w-full",
            "aspect-[4/3] sm:aspect-[16/10] md:aspect-[3/2]"
          )}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPan}
          onPointerLeave={endPan}
          onDoubleClick={onDoubleClick}
          onKeyDown={onKeyDown}
          tabIndex={0}
          style={{ touchAction: isFs ? "none" : "auto" }}
        >
          {/* slide count */}
          <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/50 px-2 py-1 text-xs font-medium text-white">
            {current + 1} / {galleryItems.length}
          </div>

          <img
            ref={imgRef}
            src={item.original}
            alt={item.originalAlt}
            draggable={false}
            className={cx(
              "absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 object-contain transition duration-200",
              loading ? "scale-[1.01] blur-[2px] opacity-80" : "opacity-100"
            )}
            style={{
              transform:
                isFs && scale > 1
                  ? `translate(${pan.x}px, ${pan.y}px) scale(${scale})`
                  : undefined,
              transformOrigin: isFs ? "0 0" : "50% 50%",
            }}
          />

          {item.caption && (
            <div className="absolute bottom-3 left-3 rounded bg-black/30 px-2 py-1 text-xs text-white backdrop-blur-sm">
              {item.caption}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLeftNav = (onClick, disabled) => (
    <button
      type="button"
      aria-label="Previous slide"
      className={cx(
        "absolute -left-6 top-1/2 z-20 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 shadow hover:bg-white",
        "ring-1 ring-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        disabled && "opacity-40 pointer-events-none"
      )}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" className="mx-auto h-5 w-5" aria-hidden="true">
        <path
          d="M15 18l-6-6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );

  const renderRightNav = (onClick, disabled) => (
    <button
      type="button"
      aria-label="Next slide"
      className={cx(
        "absolute -right-6 top-1/2 z-20 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 shadow hover:bg-white",
        "ring-1 ring-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        disabled && "opacity-40 pointer-events-none"
      )}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" className="mx-auto h-5 w-5" aria-hidden="true">
        <path
          d="M9 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );

  const handleSlide = (idx) => {
    setCurrent(idx);
    setLoading(true);
  };
  const handleScreenChange = (fs) => {
    setIsFs(!!fs);
    if (!fs) resetZoom();
  };

  return (
    <section
      id="gallery"
      className="py-12 px-6 max-w-6xl mx-auto"
      role="region"
      aria-roledescription="carousel"
      aria-label="Gallery"
    >
      {/* override react-image-gallery's built-in black backgrounds */}
      <style>{`
        /* make slide wrappers transparent so our white letterbox shows */
        .tw-gallery .image-gallery-slide,
        .tw-gallery .image-gallery-slide-wrapper,
        .tw-gallery .image-gallery-content,
        .tw-gallery .image-gallery-swipe {
          background: transparent !important;
        }
        /* fullscreen container background */
        .tw-gallery.image-gallery.fullscreen {
          background: #fff !important;
        }
      `}</style>

      <h2 className="text-2xl font-bold mb-6 text-center">Gallery</h2>

      {isAdminLoggedIn() && (
        <div className="text-center mb-6">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={() => {
              setFormData({ image: null, caption: "" });
              setEditingId(null);
              setShowForm(true);
            }}
          >
            + Add New Image
          </button>
        </div>
      )}

      {isAdminLoggedIn() && showForm && (
        <div className="mb-6 space-y-4">
          <FileUploader
            onFileAccepted={(file) => setFormData({ ...formData, image: file })}
            className="w-full border p-2"
          />
          <input
            type="text"
            placeholder="Caption (optional)"
            value={formData.caption}
            onChange={(e) =>
              setFormData({ ...formData, caption: e.target.value })
            }
            className="w-full border p-2 rounded"
          />
          <div>
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {editingId ? "Update" : "Add"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="ml-4 text-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {images.length > 0 ? (
        <div className="relative">
          <ImageGallery
            items={galleryItems}
            showPlayButton={false}
            showFullscreenButton={true}
            renderItem={renderItem}
            thumbnailPosition="bottom"
            showThumbnails={true}
            renderLeftNav={renderLeftNav}
            renderRightNav={renderRightNav}
            onSlide={handleSlide}
            onScreenChange={handleScreenChange}
            additionalClass="tw-gallery !overflow-visible !bg-transparent"
            slideDuration={200}
            lazyLoad={true}
          />
        </div>
      ) : (
        <p className="text-center text-gray-600">
          No gallery images available.
        </p>
      )}

      {/* Admin list */}
      <ul className="mt-8 space-y-4">
        {isAdminLoggedIn() &&
          images.map((img) => (
            <li
              key={img._id}
              className="flex items-center justify-between border p-4 rounded"
            >
              <div className="flex items-center gap-4">
                <img
                  src={`${baseUrl}${img.imageUrl}`}
                  alt={img.caption}
                  className="w-20 h-20 object-cover rounded"
                  loading="lazy"
                />
                <p>{img.caption}</p>
              </div>
              {isAdminLoggedIn() && (
                <div className="space-x-2">
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                    onClick={() => handleEdit(img)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => handleDelete(img._id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
      </ul>
    </section>
  );
};

export default Gallery;
