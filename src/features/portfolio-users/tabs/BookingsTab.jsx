import { useEffect, useState } from "react";
import { usePortfolioUser } from "@/shared/context/PortfolioUserContext";
import { portfolioApi } from "@/shared/api/portfolioApi";
import { portfolioUserApi } from "@/shared/api/portfolioUserApi";

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

/**
 * Fetch the portfolio once and surface the bits Bookings needs:
 *  - selectable services for the request form
 *  - owner-controlled flag for whether sub-users may cancel their own bookings
 */
function usePortfolioBookingContext(portfolioId) {
  const [services, setServices] = useState([]);
  const [allowCancellation, setAllowCancellation] = useState(false);

  useEffect(() => {
    if (!portfolioId) return;
    let cancelled = false;
    portfolioApi
      .getById(portfolioId)
      .then((res) => {
        if (cancelled) return;
        const sections = res.data?.sections || [];
        const servicesSection = sections.find((s) => s.type === "services");
        const raw = servicesSection?.data?.items || [];
        setServices(
          raw.map((item, idx) => ({
            id: item.id || item.slug || String(idx),
            label: item.title || item.name || `Service ${idx + 1}`,
          }))
        );
        setAllowCancellation(
          Boolean(res.data?.subUserSettings?.allowBookingCancellation)
        );
      })
      .catch(() => {
        if (cancelled) return;
        setServices([]);
        setAllowCancellation(false);
      });
    return () => {
      cancelled = true;
    };
  }, [portfolioId]);

  return { services, allowCancellation };
}

export default function BookingsTab() {
  const { token, portfolioId } = usePortfolioUser();
  const { services, allowCancellation } = usePortfolioBookingContext(portfolioId);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    serviceRef: "",
    serviceLabel: "",
    scheduledFor: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const refresh = () => {
    if (!token) return;
    setLoading(true);
    portfolioUserApi
      .listMyActivities(token, { status: "pending" })
      .then((res) => setPending(res.data.activities || []))
      .catch((err) =>
        setError(err?.response?.data?.error || "Failed to load bookings")
      )
      .finally(() => setLoading(false));
  };

  useEffect(refresh, [token]);

  const handleServiceChange = (e) => {
    const id = e.target.value;
    const picked = services.find((s) => s.id === id);
    setForm((prev) => ({
      ...prev,
      serviceRef: id,
      serviceLabel: picked?.label || "",
    }));
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await portfolioUserApi.createMyActivity(token, {
        type: "service",
        serviceRef: form.serviceRef,
        serviceLabel: form.serviceLabel,
        scheduledFor: form.scheduledFor || undefined,
        notes: form.notes,
      });
      setMessage({ type: "success", text: "Request submitted. We'll email you when it's reviewed." });
      setForm({ serviceRef: "", serviceLabel: "", scheduledFor: "", notes: "" });
      refresh();
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.error || "Could not submit request.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await portfolioUserApi.cancelMyActivity(token, id);
      refresh();
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.error || "Could not cancel request.",
      });
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass =
    "block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1";

  return (
    <div className="space-y-6">
      <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm">
        <header className="px-6 py-4 border-b border-gray-100 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">Request a service</h2>
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            Requests are reviewed by the provider and confirmed by email.
          </p>
        </header>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Service</label>
            {services.length > 0 ? (
              <select
                value={form.serviceRef}
                onChange={handleServiceChange}
                className={inputClass}
                required
              >
                <option value="">Select a service...</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name="serviceLabel"
                value={form.serviceLabel}
                onChange={handleChange}
                placeholder="Describe the service you need"
                className={inputClass}
                required
              />
            )}
          </div>
          <div>
            <label className={labelClass}>Preferred date &amp; time</label>
            <input
              name="scheduledFor"
              type="datetime-local"
              value={form.scheduledFor}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              name="notes"
              rows={3}
              value={form.notes}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {message && (
            <p
              className={`text-sm ${
                message.type === "success"
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit request"}
          </button>
        </form>
      </section>

      <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm">
        <header className="px-6 py-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">Pending requests</h2>
          <button
            type="button"
            onClick={refresh}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Refresh
          </button>
        </header>

        {loading ? (
          <p className="px-6 py-4 text-gray-500 dark:text-neutral-400">Loading...</p>
        ) : error ? (
          <p className="px-6 py-4 text-red-600 dark:text-red-400">{error}</p>
        ) : pending.length === 0 ? (
          <p className="px-6 py-4 text-gray-500 dark:text-neutral-400 text-sm">No pending requests.</p>
        ) : (
          <ul className="px-6 divide-y divide-gray-100 dark:divide-neutral-800">
            {pending.map((a) => (
              <li key={a._id} className="py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-neutral-100 truncate">
                    {a.serviceLabel || a.type || "Request"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-neutral-400">
                    {a.scheduledFor
                      ? `Preferred: ${formatDate(a.scheduledFor)}`
                      : `Submitted ${formatDate(a.createdAt)}`}
                  </p>
                </div>
                {allowCancellation ? (
                  <button
                    type="button"
                    onClick={() => handleCancel(a._id)}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    Cancel
                  </button>
                ) : (
                  <span
                    className="text-xs text-gray-400 dark:text-neutral-500"
                    title="Self-cancellation is disabled by the provider. Contact them to cancel."
                  >
                    Contact provider to cancel
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
