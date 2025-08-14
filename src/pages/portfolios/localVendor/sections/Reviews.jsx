import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { isAdminLoggedIn } from "../services/auth";
import API from "../services/api";

const FiveStar = ({ value = 0, onChange }) => {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label="Rating"
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
          className={`text-2xl leading-none transition ${
            active >= i ? "text-amber-500" : "text-gray-300"
          } hover:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300 rounded`}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
        >
          ★
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600">{value || 0}/5</span>
    </div>
  );
};

const StarsReadOnly = ({ rating = 0 }) => (
  <div className="text-amber-500">
    {"★".repeat(Math.max(0, Math.min(5, Number(rating) || 0)))}
    {"☆".repeat(5 - Math.max(0, Math.min(5, Number(rating) || 0)))}
  </div>
);

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({ name: "", feedback: "", rating: 1 });

  // NEW: sort + filter + scroll helpers
  const [sortBy, setSortBy] = useState("Newest");
  const [filterRating, setFilterRating] = useState("All");
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const scrollRef = useRef(null);
  const glideTimer = useRef(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = () => {
    API.get("/reviews")
      .then((res) => setReviews(res.data))
      .catch((err) => console.error("Failed to fetch reviews", err));
  };

  const handleAddReview = () => {
    setForm({ name: "", feedback: "", rating: 1 });
    setEditingIndex(reviews.length); // new-card slot
  };

  // ---- original save logic unchanged ----
  const handleSaveReview = () => {
    const payload = {
      name: form.name,
      feedback: form.feedback,
      rating: form.rating,
    };

    if (editingIndex === reviews.length) {
      API.post("/reviews", payload)
        .then(() => {
          fetchReviews();
          setEditingIndex(null);
          setForm({ name: "", feedback: "", rating: 1 });
        })
        .catch((err) => console.error("Failed to add review", err));
    } else {
      const id = reviews[editingIndex]._id;
      API.put(`/reviews/${id}`, payload)
        .then(() => {
          fetchReviews();
          setEditingIndex(null);
          setForm({ name: "", feedback: "", rating: 1 });
        })
        .catch((err) => console.error("Failed to update review", err));
    }
  };

  const handleDeleteReview = (index) => {
    const id = reviews[index]._id;
    API.delete(`/reviews/${id}`)
      .then(() => fetchReviews())
      .catch((err) => console.error("Failed to delete review", err));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setForm({ name: "", feedback: "", rating: 1 });
  };

  // ---- derived: summary + filtering + sorting ----
  const total = reviews.length;
  const counts = [1, 2, 3, 4, 5].reduce((acc, r) => {
    acc[r] = reviews.filter((rv) => Number(rv.rating) === r).length;
    return acc;
  }, {});
  const sum = reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0);
  const avg = total ? (sum / total).toFixed(1) : "0.0";

  const applyFilter = (list) =>
    filterRating === "All"
      ? list
      : list.filter((r) => Number(r.rating) === Number(filterRating));

  const sorters = {
    Newest: (a, b) =>
      new Date(b.date || b.createdAt || 0) -
      new Date(a.date || a.createdAt || 0),
    Oldest: (a, b) =>
      new Date(a.date || a.createdAt || 0) -
      new Date(b.date || b.createdAt || 0),
    Highest: (a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0),
    Lowest: (a, b) => (Number(a.rating) || 0) - (Number(b.rating) || 0),
  };

  const displayed = applyFilter([...reviews]).sort(sorters[sortBy]);

  // Which card is in "edit" mode if editing existing?
  const editingExistingId =
    editingIndex != null && editingIndex < reviews.length
      ? reviews[editingIndex]._id
      : null;

  // ---- better scroll buttons + edges ----
  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft < maxScroll - 1);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => updateScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [displayed.length]);

  const glide = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 18, behavior: "instant" });
  };
  const startGlide = (dir) => {
    stopGlide();
    glideTimer.current = setInterval(() => glide(dir), 16);
  };
  const stopGlide = () => {
    if (glideTimer.current) clearInterval(glideTimer.current);
    glideTimer.current = null;
  };

  return (
    <section id="reviews" className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl font-bold">Customer Reviews</h2>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort</span>
            <select
              className="rounded-md px-2 py-1 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {["Newest", "Oldest", "Highest", "Lowest"].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {isAdminLoggedIn() && (
            <button
              type="button"
              onClick={handleAddReview}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Add Review
            </button>
          )}
        </div>
      </div>

      {/* Summary + histogram + quick filters */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="rounded-xl p-5 bg-white shadow-md">
          <div className="text-4xl font-bold">{avg}</div>
          <div className="mt-1">
            <StarsReadOnly rating={Math.round(avg)} />
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {total} review{total !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="md:col-span-2 rounded-2xl p-5 bg-white shadow-lg transition transform hover:scale-[1.01]">
          {[5, 4, 3, 2, 1].map((r) => {
            const c = counts[r] || 0;
            const pct = total ? Math.round((c / total) * 100) : 0;
            return (
              <div key={r} className="flex items-center gap-3 mb-2">
                <span className="w-8 text-sm text-gray-600">{r}★</span>
                <div className="h-2 flex-1 rounded bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-xs text-gray-500">{pct}%</span>
              </div>
            );
          })}

          <div className="mt-4 flex flex-wrap gap-2">
            {["All", 5, 4, 3, 2, 1].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilterRating(f)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  filterRating === f
                    ? "bg-blue-600 text-white border-blue-600"
                    : "text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {f === "All" ? "All" : `${f}★`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SCROLLER */}
      <div className="relative">
        {/* edge gradients */}
        {canLeft && (
          <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent rounded-l-xl" />
        )}
        {canRight && (
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent rounded-r-xl" />
        )}

        {/* left button */}
        <button
          type="button"
          aria-label="Scroll left"
          disabled={!canLeft}
          onMouseDown={() => startGlide(-1)}
          onMouseUp={stopGlide}
          onMouseLeave={stopGlide}
          onClick={() =>
            scrollRef.current?.scrollBy({ left: -320, behavior: "smooth" })
          }
          className={`absolute -left-5 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full shadow-md bg-white flex items-center justify-center hover:bg-gray-50 transition
 ${canLeft ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          ←
        </button>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
        >
          {displayed.map((review) => {
            const isEditingThis =
              editingExistingId && review._id === editingExistingId;
            return (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="min-w-[300px] bg-white p-4 rounded-xl shadow-sm ring-1 ring-gray-100 relative"
              >
                {isEditingThis ? (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Your name
                      </label>
                      <input
                        type="text"
                        placeholder="Jane Doe"
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className=" p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Rating
                      </label>
                      <FiveStar
                        value={Number(form.rating) || 0}
                        onChange={(r) => handleChange("rating", r)}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Review
                      </label>
                      <textarea
                        placeholder="What did you think?"
                        value={form.feedback}
                        onChange={(e) =>
                          handleChange("feedback", e.target.value)
                        }
                        rows={4}
                        className="p-2 w-full rounded-md resize-y bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSaveReview}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="text-gray-600 hover:underline px-3 py-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-lg">
                          {review.name}
                        </div>
                        <div className="mt-1">
                          <StarsReadOnly rating={review.rating} />
                        </div>
                      </div>

                      {isAdminLoggedIn() && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            title="Edit review"
                            onClick={() => {
                              const baseIndex = reviews.findIndex(
                                (r) => r._id === review._id
                              );
                              setEditingIndex(baseIndex);
                              setForm({
                                name: review.name,
                                feedback: review.feedback,
                                rating: review.rating,
                              });
                            }}
                            className="rounded px-2 py-1 text-sm bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            title="Delete review"
                            onClick={() => {
                              const baseIndex = reviews.findIndex(
                                (r) => r._id === review._id
                              );
                              handleDeleteReview(baseIndex);
                            }}
                            className="rounded px-2 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-700 mt-3">{review.feedback}</p>

                    <p className="text-xs text-gray-400 mt-3">
                      {review.date
                        ? new Date(review.date).toLocaleDateString()
                        : review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString()
                        : ""}
                    </p>
                  </>
                )}
              </motion.div>
            );
          })}

          {/* add-new inline card at the end (your original pattern) */}
          {editingIndex === reviews.length && (
            <motion.div
              key="new-review-editor"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="min-w-[300px] bg-white p-4 rounded-xl shadow-sm ring-1 ring-gray-100 relative"
            >
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Your name
                  </label>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Rating
                  </label>
                  <FiveStar
                    value={Number(form.rating) || 0}
                    onChange={(r) => handleChange("rating", r)}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Review
                  </label>
                  <textarea
                    placeholder="What did you think?"
                    value={form.feedback}
                    onChange={(e) => handleChange("feedback", e.target.value)}
                    rows={4}
                    className="border p-2 w-full rounded resize-y focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveReview}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="text-gray-600 hover:underline px-3 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* right button */}
        <button
          type="button"
          aria-label="Scroll right"
          disabled={!canRight}
          onMouseDown={() => startGlide(1)}
          onMouseUp={stopGlide}
          onMouseLeave={stopGlide}
          onClick={() =>
            scrollRef.current?.scrollBy({ left: 320, behavior: "smooth" })
          }
          className={`absolute -right-5 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full shadow-lg bg-white flex items-center justify-center hover:scale-105 hover:bg-gray-50 transition ${
            canRight ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          →
        </button>
      </div>
    </section>
  );
};

export default Reviews;
