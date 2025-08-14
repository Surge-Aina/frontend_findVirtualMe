import { useEffect, useRef, useState } from "react";
import API from "../services/api";
import { isAdminLoggedIn } from "../services/auth";
import FileUploader from "../components/FileUploader";
import { toast } from "react-toastify";

const PAGE_SIZE = 6; // your limit

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [quickView, setQuickView] = useState(null);
  const openQuickView = (item) => setQuickView(item);
  const closeQuickView = () => setQuickView(null);

  // filters
  const [activeCategory, setActiveCategory] = useState("All");
  const [allCategories, setAllCategories] = useState(["All"]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const [autoLoad, setAutoLoad] = useState(false); // <-- new: gate infinite scroll
  const loadMoreRef = useRef(null);

  // form
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    isAvailable: true,
    unavailableUntil: "",
    image: null,
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // modal
  const [viewItem, setViewItem] = useState(null);

  // categories for chips
  useEffect(() => {
    API.get("/menu")
      .then((res) => {
        const allCats = [
          "All",
          ...Array.from(
            new Set(
              res.data
                .map((item) => item.category)
                .filter((cat) => cat && cat.trim() !== "")
            )
          ),
        ];
        setAllCategories(allCats);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // fetch list by category
  useEffect(() => {
    const url =
      activeCategory && activeCategory !== "All"
        ? `/menu?category=${encodeURIComponent(activeCategory)}`
        : "/menu";
    setLoading(true);
    API.get(url)
      .then((res) => {
        setMenuItems(res.data || []);
        setPage(1);
        setAutoLoad(false); // reset autoload on filter change
      })
      .catch((err) => console.error("Error fetching menu:", err))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  // enable auto-load only after user clicks Load more once
  useEffect(() => {
    if (!autoLoad) return;
    const node = loadMoreRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setPage((p) => p + 1);
      },
      { rootMargin: "400px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [autoLoad]);

  // derived lists (search/sort client-side)
  const normalized = (s) => (s || "").toString().toLowerCase().trim();
  const filtered = menuItems.filter((item) => {
    const hit =
      normalized(item.name).includes(normalized(q)) ||
      normalized(item.description).includes(normalized(q)) ||
      normalized(item.category).includes(normalized(q));
    return hit;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "az") return normalized(a.name) > normalized(b.name) ? 1 : -1;
    if (sort === "price_asc") return Number(a.price) - Number(b.price);
    if (sort === "price_desc") return Number(b.price) - Number(a.price);
    return 0; // “popular” placeholder
  });

  const visible = sorted.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < sorted.length;

  const handleLoadMore = () => {
    // First click reveals next page and turns on autoLoad for subsequent pages
    setPage((p) => p + 1);
    setAutoLoad(true);
  };

  // CRUD
  const handleSubmit = () => {
    if (
      formData.image instanceof File &&
      formData.image.size > 2 * 1024 * 1024
    ) {
      toast.error("Please upload a valid image under 2MB");
      return;
    }

    const formPayload = new FormData();
    formPayload.append("name", formData.name);
    formPayload.append("description", formData.description);
    formPayload.append("price", formData.price);
    formPayload.append("category", formData.category);
    formPayload.append("isAvailable", formData.isAvailable);
    formPayload.append("unavailableUntil", formData.unavailableUntil || "");
    if (formData.image) formPayload.append("image", formData.image);

    const request = editingId
      ? API.put(`/menu/${editingId}`, formPayload, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      : API.post("/menu", formPayload, {
          headers: { "Content-Type": "multipart/form-data" },
        });

    request
      .then(() => {
        const url =
          activeCategory && activeCategory !== "All"
            ? `/menu?category=${encodeURIComponent(activeCategory)}`
            : "/menu";
        return API.get(url);
      })
      .then((res) => {
        setMenuItems(res.data || []);
        setPage(1);
        setAutoLoad(false);
        setFormData({
          name: "",
          price: "",
          description: "",
          category: "",
          isAvailable: true,
          unavailableUntil: "",
          image: null,
        });
        setEditingId(null);
        setShowForm(false);
        toast.success(editingId ? "Menu item updated!" : "Menu item created!");
      })
      .catch((err) => console.error("Save failed:", err));
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category || "",
      isAvailable: item.isAvailable,
      unavailableUntil: item.unavailableUntil || "",
      image: null,
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure?")) {
      API.delete(`/menu/${id}`)
        .then(() => setMenuItems((prev) => prev.filter((i) => i._id !== id)))
        .catch((err) => console.error("Delete failed:", err));
    }
  };

  return (
    <section id="menu" className="py-10 px-4 md:px-6 max-w-6xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-center text-gray-800 tracking-tight">
        Menu
      </h2>

      {isAdminLoggedIn() && (
        <div className="text-center mb-4">
          <button
            onClick={() => {
              setFormData({
                name: "",
                price: "",
                description: "",
                category: "",
                isAvailable: true,
                unavailableUntil: "",
                image: null,
              });
              setEditingId(null);
              setShowForm(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Add Menu Item
          </button>
        </div>
      )}

      {/* Sticky filter/search/sort */}
      <div className="sticky top-14 z-10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-gray-200">
        <div className="py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pr-1">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm border shadow-sm transition ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search menu…"
              className="h-9 w-44 md:w-56 rounded-lg shadow-md px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-9 rounded-lg shadow-sm px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            >
              <option value="">Sort</option>
              <option value="az">A–Z</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
            </select>
          </div>
        </div>
      </div>

      {isAdminLoggedIn() && showForm && (
        <div className="space-y-4 my-6 max-w-md mx-auto">
          {/* form fields ... unchanged */}
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Price"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full border p-2 rounded"
          />

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="availability"
                value="available"
                checked={formData.isAvailable}
                onChange={() =>
                  setFormData({
                    ...formData,
                    isAvailable: true,
                    unavailableUntil: "",
                  })
                }
              />
              <span>Available</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="availability"
                value="unavailable"
                checked={!formData.isAvailable}
                onChange={() =>
                  setFormData({ ...formData, isAvailable: false })
                }
              />
              <span>Unavailable</span>
            </label>
          </div>

          {!formData.isAvailable && (
            <div className="mb-2">
              <label className="block text-sm font-medium">
                Available From
              </label>
              <input
                type="date"
                value={formData.unavailableUntil}
                onChange={(e) =>
                  setFormData({ ...formData, unavailableUntil: e.target.value })
                }
                className="w-full border p-2 rounded"
                required
              />
            </div>
          )}

          <FileUploader
            onFileAccepted={(file) => setFormData({ ...formData, image: file })}
            className="w-full border p-2 rounded"
          />

          <div className="flex justify-between">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {editingId ? "Update" : "Add"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => {
          const unavailableByFlag = item.isAvailable === false;
          const unavailableByDate =
            item.unavailableUntil &&
            new Date(item.unavailableUntil) > new Date();
          const isUnavailable = unavailableByFlag || unavailableByDate;

          return (
            <div
              key={item._id}
              className={`group relative rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/70 hover:shadow-md hover:ring-gray-300 transition ${
                isUnavailable ? "opacity-60 grayscale" : ""
              }`}
            >
              {/* image */}
              {item.image && (
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    src={`${import.meta.env.VITE_BACKEND_API}${item.image}`}
                    alt={item.name}
                    className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  {/* soft bottom fade for text legibility */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent" />
                  {/* category pill (optional) */}
                  {item.category ? (
                    <span className="absolute left-3 bottom-3 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-800 shadow">
                      {item.category}
                    </span>
                  ) : null}
                  {/* availability banner (kept from your logic) */}
                  {isUnavailable && item.unavailableUntil && (
                    <div className="absolute top-2 left-2 rounded-md bg-red-600/90 px-2 py-1 text-[11px] font-semibold text-white shadow">
                      Available{" "}
                      {new Date(item.unavailableUntil).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}

              {/* body */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {item.description}
                    </p>
                  </div>
                  {/* price chip */}
                  <div className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                    ${item.price}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  {/* <button
                    className="rounded-full border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => openQuickView(item)}
                  >
                    View
                  </button> */}

                  {isAdminLoggedIn() && (
                    <div className="flex gap-2">
                      <button
                        className="rounded-md bg-yellow-100 px-3 py-1 text-sm text-yellow-900 hover:bg-yellow-200"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded-md bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200"
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && visible.length === 0 && (
        <div className="mt-10 text-center text-gray-500">
          No items found{q ? ` for “${q}”` : ""}.
        </div>
      )}

      {/* Manual-first Load more */}
      <div className="mt-8 flex justify-center">
        {hasMore && (
          <button
            onClick={handleLoadMore}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Load more
          </button>
        )}
      </div>

      {/* Sentinel (only used after first click) */}
      <div ref={loadMoreRef} className="h-2 w-full" />

      {/* View modal (no Enquire) */}
      {viewItem && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onClick={() => setViewItem(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-[4/3] overflow-hidden">
              {viewItem.image && (
                <img
                  src={`${import.meta.env.VITE_BACKEND_API}${viewItem.image}`}
                  alt={viewItem.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              )}
            </div>
            <div className="p-4">
              {(viewItem.isAvailable === false ||
                (viewItem.unavailableUntil &&
                  new Date(viewItem.unavailableUntil) > new Date())) && (
                <div className="mb-2 inline-block rounded bg-yellow-600 px-2 py-0.5 text-xs font-medium text-white">
                  {viewItem.unavailableUntil &&
                  new Date(viewItem.unavailableUntil) > new Date()
                    ? `Available from: ${new Date(
                        viewItem.unavailableUntil
                      ).toLocaleDateString()}`
                    : "Currently unavailable"}
                </div>
              )}

              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold">{viewItem.name}</h3>
                <button
                  onClick={() => setViewItem(null)}
                  className="rounded-md border px-2 py-1 text-sm hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-600">{viewItem.category}</p>
              <p className="mt-2 text-gray-800">{viewItem.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xl font-semibold">${viewItem.price}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Menu;
