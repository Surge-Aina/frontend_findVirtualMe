import { useEffect, useState, useContext } from "react";
import { useVendorApi } from "../services/api";
import { useVendor } from "../../../../context/VendorContext";
import { FiEdit } from "react-icons/fi";
import { canEditPortfolio } from "../services/auth";
import { AuthContext } from "../../../../context/AuthContext";
import FileUploader from "../components/FileUploader";
import { toast } from "react-toastify";

const SHAPE_CLASS = {
  blob: "clip-blob",
  oval: "rounded-[50%]",
  square: "rounded-none",
  fullscreen: "",
};

const Banner = () => {
  const [banner, setBanner] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const { vendorId } = useVendor();
  const api = useVendorApi();

  const { user } = useContext(AuthContext);
  const canEdit = canEditPortfolio(vendorId);

  useEffect(() => {
    if (!vendorId) return; // don’t fetch until a vendor is set
    api
      .getBanner()
      .then((data) => {
        if (data?.length) setBanner(data[0]);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, [vendorId]);

  const handleSave = () => {
    if (!editData) return;

    const img = editData.image;
    if (img instanceof File) {
      if (!/^image\//.test(img.type)) {
        toast.error("Please upload a valid image file");
        return;
      }
      if (img.size > 4 * 1024 * 1024) {
        toast.error("Please upload an image under 4MB");
        return;
      }
    }

    const payload = new FormData();
    payload.append("title", editData.title || "");
    payload.append("description", editData.description || "");
    payload.append("shape", editData.shape || "fullscreen");
    if (img instanceof File) payload.append("image", img);

    // 🔹 vendor-aware save: create or update
    const req = banner?._id ? api.updateBanner(banner._id, payload) : api.createBanner(payload);

    req
      .then((res) => {
        setBanner(res);
        setEditing(false);
        setEditData(null);
        toast.success("Home screen updated!");
      })
      .catch((err) => console.error("Save error:", err));
  };

  if (!banner) {
    return (
      <section id="home" className="min-h-[60vh] grid place-items-center">
        <div className="animate-pulse h-10 w-48 bg-gray-200 rounded" />
      </section>
    );
  }

  return (
    <section id="home" className="relative">
      <div className={`relative w-full ${banner.shape === "fullscreen" ? "h-screen" : "h-[70vh]"} overflow-hidden`}>
        {banner?.image && (
          <img
            src={banner.image.startsWith("http") ? banner.image : `${import.meta.env.VITE_BACKEND_API}${banner.image}`}
            alt={banner.title || "Hero image"}
            className={`absolute inset-0 h-full w-full object-cover ${SHAPE_CLASS[banner.shape] || ""}`}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/45" />

        {canEdit && !editing && (
          <button
            onClick={() => {
              setEditing(true);
              setEditData({ ...banner, image: null });
            }}
            className="absolute right-4 top-4 z-[100] pointer-events-auto rounded-full bg-white/90 p-2 text-black shadow hover:bg-white"
            title="Edit Banner"
            data-cy="banner-edit-btn"
          >
            <FiEdit className="text-xl" />
          </button>
        )}

        <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center">
          {editing ? (
            <>
              <input
                className="mb-2 w-full max-w-3xl rounded-lg bg-white/90 px-3 py-2 text-3xl font-bold md:text-5xl"
                value={editData?.title || ""}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                placeholder="Brand Name"
                data-cy="banner-title-input"
              />
              <input
                className="mb-3 w-full max-w-3xl rounded-lg bg-white/90 px-3 py-2"
                value={editData?.description || ""}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                placeholder="Short tagline/description"
                data-cy="banner-description-input"
              />
              <select
                className="mb-3 rounded-lg bg-white/90 px-3 py-2"
                value={editData?.shape || "fullscreen"}
                data-cy="banner-shape-select"
                onChange={(e) => setEditData({ ...editData, shape: e.target.value })}
              >
                <option value="fullscreen">Fullscreen</option>
                <option value="blob">Blob</option>
                <option value="oval">Oval</option>
                <option value="square">Square</option>
              </select>

              <FileUploader
                onFileAccepted={(file) => setEditData({ ...editData, image: file })}
                className="mb-2 text-white"
              />

              <div className="mt-2 space-x-2">
                <button
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  onClick={handleSave}
                  data-cy="banner-save-btn"
                >
                  Save
                </button>
                <button
                  className="rounded px-4 py-2 text-white underline"
                  data-cy="banner-cancel-btn"
                  onClick={() => {
                    setEditing(false);
                    setEditData(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-2xl bg-black/30 px-4 py-2 backdrop-blur-sm">
                <h1 className="text-4xl font-extrabold uppercase tracking-tight text-white drop-shadow sm:text-6xl md:text-7xl">
                  {banner.title}
                </h1>
              </div>

              <p className="mt-4 max-w-3xl text-base text-white/95 drop-shadow sm:text-lg md:text-xl">
                {banner.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="#menu"
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-base font-semibold text-white shadow transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  View Menu
                </a>
                <a
                  href="#about"
                  className="rounded-xl px-5 py-3 text-base font-semibold text-white/90 ring-1 ring-white/60 hover:text-white hover:ring-white focus:outline-none focus:ring-2 focus:ring-white/80"
                >
                  About Us
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Banner;
