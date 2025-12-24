import { useState, useEffect, useRef, useContext } from "react";
import { motion } from "framer-motion";
import { useVendor } from "../../../../context/VendorContext";
import { useVendorApi } from "../services/api";
import FileUploader from "../components/FileUploader";
import { canEditPortfolio } from "../services/auth";
import { AuthContext } from "../../../../context/AuthContext";

const MAX_IMAGES = 4;

// stable id for React keys when Mongo _id is absent
const genId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

const AboutSection = () => {
  const [leftBlocks, setLeftBlocks] = useState([]);
  const [rightBlocks, setRightBlocks] = useState([]);
  const [bottomImages, setBottomImages] = useState([]);
  const dragIndexRef = useRef(null);

  //  initialize vendor-aware API
  const { vendorId } = useVendor();
  const api = useVendorApi();

  const { user } = useContext(AuthContext);
  const canEdit = canEditPortfolio(vendorId);

  useEffect(() => {
    if (!vendorId) return; // don’t fetch until vendor selected
    api
      .getAbout()
      .then((data) => {
        const blocks = data?.contentBlocks || [];
        const midpoint = Math.ceil(blocks.length / 2);

        const withIds = (arr) =>
          arr.map((b) => ({
            ...b,
            isEditing: false,
            clientId: b._id || b.clientId || genId(),
          }));

        setLeftBlocks(withIds(blocks.slice(0, midpoint)));
        setRightBlocks(withIds(blocks.slice(midpoint)));
        setBottomImages((data.gridImages || []).slice(0, MAX_IMAGES));
      })
      .catch((err) => console.error("Failed to fetch or create about data", err));
  }, [vendorId]);

  // ----- text blocks -----
  const handleAddTextBlock = (side) => {
    const newBlock = {
      heading: "",
      subheading: "",
      isEditing: true,
      clientId: genId(),
    };
    const updated = side === "left" ? [...leftBlocks, newBlock] : [...rightBlocks, newBlock];
    saveBlocks(side, updated);
  };

  const handleEditToggle = (side, index) => {
    const blocks = side === "left" ? [...leftBlocks] : [...rightBlocks];
    blocks[index].isEditing = !blocks[index].isEditing;
    saveBlocks(side, blocks);
  };

  const handleDelete = (side, index) => {
    const blocks = side === "left" ? [...leftBlocks] : [...rightBlocks];
    blocks.splice(index, 1);
    saveBlocks(side, blocks);
  };

  const handleChange = (side, index, field, value) => {
    const blocks = side === "left" ? [...leftBlocks] : [...rightBlocks];
    blocks[index][field] = value;
    side === "left" ? setLeftBlocks(blocks) : setRightBlocks(blocks);
  };

  const saveBlocks = (side, updatedBlocks) => {
    const mergedBlocks = side === "left" ? [...updatedBlocks, ...rightBlocks] : [...leftBlocks, ...updatedBlocks];

    // vendor-aware updateAbout
    api
      .updateAbout({
        contentBlocks: mergedBlocks.map(({ isEditing, clientId, ...b }) => b),
        gridImages: bottomImages,
      })
      .then(() => {
        side === "left" ? setLeftBlocks(updatedBlocks) : setRightBlocks(updatedBlocks);
      })
      .catch((err) => console.error("Failed to save content blocks", err));
  };

  // ----- drag & drop reorder -----
  const onDragStart = (side, index) => (dragIndexRef.current = { side, index });
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (side, index) => {
    const start = dragIndexRef.current;
    if (!start || start.side !== side) return;
    const list = side === "left" ? [...leftBlocks] : [...rightBlocks];
    const [moved] = list.splice(start.index, 1);
    list.splice(index, 0, moved);
    saveBlocks(side, list);
    dragIndexRef.current = null;
  };

  // ----- images -----
  const handleAddImage = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = Math.max(0, MAX_IMAGES - bottomImages.length);
    const toUpload = files.slice(0, remaining);
    if (!toUpload.length) {
      e.target.value = "";
      return;
    }

    const payload = new FormData();
    toUpload.forEach((file) => payload.append("images", file));

    try {
      // 🔹 vendor-aware upload & update
      const res = await api.uploadAboutImages(payload);
      const uploaded = (res?.urls || []).slice(0, remaining);
      const newImages = [...bottomImages, ...uploaded].slice(0, MAX_IMAGES);
      setBottomImages(newImages);
      await api.updateAbout({ gridImages: newImages });
    } catch (err) {
      console.error("Failed to upload/persist images", err);
    } finally {
      e.target.value = "";
    }
  };

  const handleDeleteImage = async (src) => {
    if (!window.confirm("Remove this image from the About gallery?")) return;
    const newImages = bottomImages.filter((u) => u !== src);
    setBottomImages(newImages);
    try {
      // 🔹 vendor-aware update
      await api.updateAbout({ gridImages: newImages });
    } catch (err) {
      console.error("Failed to persist image removal", err);
    }
  };

  return (
    <section id="about" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10" data-cy="about-section">
      {/* Two-column content */}
      <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-10">
        {/* Column A */}
        <motion.div
          className="relative rounded-2xl bg-white p-6 shadow-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {leftBlocks.map((block, idx) => (
            <div
              key={block._id || block.clientId}
              className="group relative p-4 mb-4 rounded-xl bg-slate-50/60"
              data-cy={`about-block-left-${idx}`}
              draggable={canEdit}
              onDragStart={() => onDragStart("left", idx)}
              onDragOver={onDragOver}
              onDrop={() => onDrop("left", idx)}
            >
              {canEdit && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-3 text-sm">
                  <button
                    onClick={() => handleEditToggle("left", idx)}
                    data-cy={`about-edit-left-${idx}`}
                    className="text-blue-700 hover:underline"
                  >
                    {block.isEditing ? "Save" : "Edit"}
                  </button>
                  <button
                    onClick={() => handleDelete("left", idx)}
                    data-cy={`about-delete-left-${idx}`}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              )}

              {block.isEditing ? (
                <>
                  <input
                    type="text"
                    value={block.heading}
                    onChange={(e) => handleChange("left", idx, "heading", e.target.value)}
                    placeholder="Heading"
                    className="p-2 w-full mb-2 rounded-lg bg-white shadow-inner outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <textarea
                    value={block.subheading}
                    onChange={(e) => handleChange("left", idx, "subheading", e.target.value)}
                    placeholder="Subheading"
                    className="p-2 w-full mb-2 rounded-lg bg-white shadow-inner outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </>
              ) : (
                <>
                  {block.heading && <h4 className="text-lg font-semibold text-slate-900">{block.heading}</h4>}
                  <p className="text-slate-700 whitespace-pre-line leading-7 max-w-prose">{block.subheading}</p>
                </>
              )}
            </div>
          ))}

          {canEdit && (
            <button
              className="mt-2 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow hover:brightness-105 transition"
              onClick={() => handleAddTextBlock("left")}
              data-cy="about-add-left"
            >
              + Add Block
            </button>
          )}
        </motion.div>

        {/* Column B */}
        <motion.div
          className="relative rounded-2xl bg-white p-6 shadow-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
        >
          {rightBlocks.map((block, idx) => (
            <div
              key={block._id || block.clientId}
              className="group relative p-4 mb-4 rounded-xl bg-slate-50/60"
              data-cy={`about-block-right-${idx}`}
              draggable={canEdit}
              onDragStart={() => onDragStart("right", idx)}
              onDragOver={onDragOver}
              onDrop={() => onDrop("right", idx)}
            >
              {canEdit && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-3 text-sm">
                  <button
                    onClick={() => handleEditToggle("right", idx)}
                    data-cy={`about-edit-right-${idx}`}
                    className="text-blue-700 hover:underline"
                  >
                    {block.isEditing ? "Save" : "Edit"}
                  </button>
                  <button
                    onClick={() => handleDelete("right", idx)}
                    data-cy={`about-delete-right-${idx}`}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              )}

              {block.isEditing ? (
                <>
                  <input
                    type="text"
                    value={block.heading}
                    data-cy="about-heading-input"
                    onChange={(e) => handleChange("right", idx, "heading", e.target.value)}
                    placeholder="Heading"
                    className="p-2 w-full mb-2 rounded-lg bg-white shadow-inner outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <textarea
                    value={block.subheading}
                    onChange={(e) => handleChange("right", idx, "subheading", e.target.value)}
                    placeholder="Subheading"
                    data-cy="about-subheading-input"
                    className="p-2 w-full mb-2 rounded-lg bg-white shadow-inner outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </>
              ) : (
                <>
                  {block.heading && <h4 className="text-lg font-semibold text-slate-900">{block.heading}</h4>}
                  <p className="text-slate-700 whitespace-pre-line leading-7 max-w-prose">{block.subheading}</p>
                </>
              )}
            </div>
          ))}

          {canEdit && (
            <button
              className="mt-2 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow hover:brightness-105 transition"
              onClick={() => handleAddTextBlock("right")}
              data-cy="about-add-right"
            >
              + Add Block
            </button>
          )}
        </motion.div>
      </div>

      {/* Bottom images — NO visible container/card */}
      <motion.div
        className="mt-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1 }}
      >
        {canEdit && (
          <div className="mb-4 flex items-center justify-between">
            <input
              type="file"
              data-cy="about-image-upload"
              accept="image/*"
              multiple
              onChange={handleAddImage}
              disabled={bottomImages.length >= MAX_IMAGES}
              className="disabled:opacity-50"
            />
            <span className="text-sm text-slate-500">
              {bottomImages.length}/{MAX_IMAGES}
            </span>
          </div>
        )}

        {/* Pinterest-y, no per-image box */}
        <div className="columns-1 sm:columns-2 gap-4 [column-fill:_balance]">
          {bottomImages.map((src) => (
            <div key={src} className="relative mb-4 break-inside-avoid">
              <img
                src={src.startsWith("http") ? src : `${import.meta.env.VITE_BACKEND_API}${src}`}
                alt=""
                loading="lazy"
                className="block w-full h-auto ..."
              />
              {canEdit && (
                <button
                  onClick={() => handleDeleteImage(src)}
                  className="absolute top-2 right-2 px-2.5 py-1.5 rounded-md text-xs font-medium bg-white/80 backdrop-blur hover:bg-white shadow transition"
                  title="Remove image"
                  data-cy="about-image-delete"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default AboutSection;
