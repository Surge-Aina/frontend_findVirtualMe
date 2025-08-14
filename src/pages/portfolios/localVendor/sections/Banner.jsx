import { useEffect, useState } from "react";
import API from "../services/api";
import { FiEdit } from "react-icons/fi";
import { isAdminLoggedIn } from "../services/auth";
import FileUploader from "../components/FileUploader";
import { toast } from "react-toastify";

const SHAPE_CLASS = {
  blob: "clip-blob", // you already have this CSS
  oval: "rounded-[50%]", // full ellipse look
  square: "rounded-none",
  fullscreen: "", // no extra styling
};

const Banner = () => {
  const [banner, setBanner] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    API.get("/banner")
      .then((res) => {
        const data = res.data?.[0] || {};
        setBanner(data);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const handleSave = () => {
    if (!editData) return;

    // ✅ validate the file that’s actually being saved (bug fix)
    const img = editData.image;
    if (img instanceof File) {
      if (!/^image\//.test(img.type)) {
        toast.error("Please upload a valid image file");
        return;
      }
      if (img.size > 2 * 1024 * 1024) {
        toast.error("Please upload an image under 2MB");
        return;
      }
    }

    const payload = new FormData();
    payload.append("title", editData.title || "");
    payload.append("description", editData.description || "");
    payload.append("shape", editData.shape || "fullscreen");
    if (img instanceof File) payload.append("image", img);

    const endpoint = banner?._id ? `/banner/${banner._id}` : "/banner";
    const req = banner?._id
      ? API.put(endpoint, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      : API.post(endpoint, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });

    req
      .then((res) => {
        setBanner(res.data);
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

  const isAdmin = isAdminLoggedIn();

  return (
    <section id="home" className="relative">
      <div
        className={`relative w-full ${
          banner.shape === "fullscreen" ? "h-screen" : "h-[70vh]"
        } overflow-hidden`}
      >
        {/* Background image */}
        {banner?.image && (
          <img
            src={`${import.meta.env.VITE_BAKEND_API}${banner.image}`}
            alt={banner.title || "Hero image"}
            className={`absolute inset-0 h-full w-full object-cover ${
              SHAPE_CLASS[banner.shape] || ""
            }`}
          />
        )}

        {/* Always-on contrast overlay (works for any photo) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/45" />

        {/* Admin edit button OUTSIDE the centered content */}
        {isAdmin && !editing && (
          <button
            onClick={() => {
              setEditing(true);
              setEditData({ ...banner, image: null }); // keep file field separate
            }}
            className="absolute right-4 top-4 z-20 rounded-full bg-white/90 p-2 text-black shadow hover:bg-white"
            title="Edit Banner"
          >
            <FiEdit className="text-xl" />
          </button>
        )}

        {/* Centered content */}
        <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center">
          {editing ? (
            <>
              <input
                className="mb-2 w-full max-w-3xl rounded-lg bg-white/90 px-3 py-2 text-3xl font-bold md:text-5xl"
                value={editData?.title || ""}
                onChange={(e) =>
                  setEditData({ ...editData, title: e.target.value })
                }
                placeholder="Brand Name"
              />
              <input
                className="mb-3 w-full max-w-3xl rounded-lg bg-white/90 px-3 py-2"
                value={editData?.description || ""}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
                placeholder="Short tagline/description"
              />
              <select
                className="mb-3 rounded-lg bg-white/90 px-3 py-2"
                value={editData?.shape || "fullscreen"}
                onChange={(e) =>
                  setEditData({ ...editData, shape: e.target.value })
                }
              >
                <option value="fullscreen">Fullscreen</option>
                <option value="blob">Blob</option>
                <option value="oval">Oval</option>
                <option value="square">Square</option>
              </select>

              <FileUploader
                onFileAccepted={(file) =>
                  setEditData({ ...editData, image: file })
                }
                className="mb-2 text-white"
              />

              <div className="mt-2 space-x-2">
                <button
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  onClick={handleSave}
                >
                  Save
                </button>
                <button
                  className="rounded px-4 py-2 text-white underline"
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
              {/* Text panel with slight blur for busy images */}
              <div className="rounded-2xl bg-black/30 px-4 py-2 backdrop-blur-sm">
                <h1 className="text-4xl font-extrabold uppercase tracking-tight text-white drop-shadow sm:text-6xl md:text-7xl">
                  {banner.title}
                </h1>
              </div>

              <p className="mt-4 max-w-3xl text-base text-white/95 drop-shadow sm:text-lg md:text-xl">
                {banner.description}
              </p>

              {/* CTAs */}
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
