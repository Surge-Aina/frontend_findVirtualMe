import { useCallback, useEffect, useMemo, useState } from "react";
import { portfolioOwnerActivityApi } from "@/shared/api/portfolioUserApi";
import { portfolioApi } from "@/shared/api/portfolioApi";

/**
 * Owner-side admin panel embedded into the portfolio editor. Combines:
 *  - sub-user list for this portfolio
 *  - pending activity requests (approve / reschedule / decline)
 *  - upcoming & past activities
 *  - inline "add past visit" form
 */

const STATUS_STYLES = {
  pending:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  confirmed:
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800",
  completed:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
  declined:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
  cancelled:
    "bg-gray-100 text-gray-700 border-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700",
};

function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded border ${cls}`}>
      {status}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

function PendingApprovals({ activities, onUpdate, onReschedule }) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-neutral-400 px-6 py-4">
        No pending requests.
      </p>
    );
  }
  return (
    <ul className="px-6 divide-y divide-gray-100 dark:divide-neutral-700">
      {activities.map((a) => (
        <li key={a._id} className="py-3 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[12rem]">
            <p className="font-medium text-gray-900 dark:text-neutral-100">
              {a.serviceLabel || a.type}
            </p>
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              Requested for {formatDate(a.scheduledFor) || "unspecified"}
            </p>
            {a.notes && (
              <p className="text-sm text-gray-600 dark:text-neutral-300 mt-1">
                {a.notes}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onUpdate(a._id, { status: "confirmed" })}
            className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => onReschedule(a)}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-sm hover:bg-amber-600"
          >
            Reschedule
          </button>
          <button
            type="button"
            onClick={() => onUpdate(a._id, { status: "declined" })}
            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
          >
            Decline
          </button>
        </li>
      ))}
    </ul>
  );
}

function ActivityList({ activities, emptyLabel, onComplete }) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-neutral-400 px-6 py-4">
        {emptyLabel}
      </p>
    );
  }
  return (
    <ul className="px-6 divide-y divide-gray-100 dark:divide-neutral-700">
      {activities.map((a) => (
        <li key={a._id} className="py-3 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-gray-900 dark:text-neutral-100 truncate">
                {a.serviceLabel || a.type}
              </p>
              <StatusBadge status={a.status} />
            </div>
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              {formatDate(a.scheduledFor) || formatDate(a.createdAt)}
            </p>
          </div>
          {onComplete && a.status !== "completed" && (
            <button
              type="button"
              onClick={() => onComplete(a._id)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Mark completed
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

function ManualEntryForm({ portfolioId, subUsers, onCreate }) {
  const [form, setForm] = useState({
    portfolioUserId: "",
    type: "visit",
    serviceLabel: "",
    scheduledFor: "",
    notes: "",
    status: "completed",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.portfolioUserId) {
      setMessage({ type: "error", text: "Select a customer first." });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      await onCreate({ ...form, portfolioId });
      setMessage({ type: "success", text: "Activity recorded." });
      setForm({
        portfolioUserId: "",
        type: "visit",
        serviceLabel: "",
        scheduledFor: "",
        notes: "",
        status: "completed",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.error || "Failed to record activity.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
            Customer
          </label>
          <select
            name="portfolioUserId"
            value={form.portfolioUserId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg"
            required
          >
            <option value="">Select a customer...</option>
            {subUsers.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name || u.email}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
            Status
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg"
          >
            <option value="completed">Completed</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
            Type
          </label>
          <input
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
            Service / label
          </label>
          <input
            name="serviceLabel"
            value={form.serviceLabel}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
            Date & time
          </label>
          <input
            type="datetime-local"
            name="scheduledFor"
            value={form.scheduledFor}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
            Notes
          </label>
          <input
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg"
          />
        </div>
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
        {submitting ? "Saving..." : "Record activity"}
      </button>
    </form>
  );
}

export default function OwnerSubUsersPanel({ portfolioId }) {
  const [subUsers, setSubUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allowCancellation, setAllowCancellation] = useState(false);
  const [savingPermission, setSavingPermission] = useState(false);
  const [permissionError, setPermissionError] = useState(null);

  const load = useCallback(async () => {
    if (!portfolioId) return;
    setLoading(true);
    setError(null);
    try {
      const [users, acts, portfolio] = await Promise.all([
        portfolioOwnerActivityApi.listSubUsers(portfolioId),
        portfolioOwnerActivityApi.list({ portfolioId }),
        portfolioApi.getById(portfolioId),
      ]);
      setSubUsers(users.data?.data || []);
      setActivities(acts.data?.activities || []);
      setAllowCancellation(
        Boolean(portfolio.data?.subUserSettings?.allowBookingCancellation)
      );
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load sub-user data.");
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggleCancellation = async (event) => {
    const next = event.target.checked;
    setSavingPermission(true);
    setPermissionError(null);
    setAllowCancellation(next);
    try {
      await portfolioApi.update(portfolioId, {
        subUserSettings: { allowBookingCancellation: next },
      });
    } catch (err) {
      setAllowCancellation(!next);
      setPermissionError(
        err?.response?.data?.error || "Failed to update permission."
      );
    } finally {
      setSavingPermission(false);
    }
  };

  const { pending, upcoming, past } = useMemo(() => {
    const now = Date.now();
    const pe = [];
    const up = [];
    const pa = [];
    for (const a of activities) {
      if (a.status === "pending") {
        pe.push(a);
        continue;
      }
      const when = a.scheduledFor ? new Date(a.scheduledFor).getTime() : null;
      const isFinal = ["completed", "declined", "cancelled"].includes(a.status);
      if (isFinal || (when !== null && when < now)) {
        pa.push(a);
      } else {
        up.push(a);
      }
    }
    return { pending: pe, upcoming: up, past: pa };
  }, [activities]);

  const updateActivity = async (id, updates) => {
    await portfolioOwnerActivityApi.update(id, updates);
    load();
  };

  const handleReschedule = async (activity) => {
    const next = window.prompt(
      "Reschedule to (YYYY-MM-DD HH:mm):",
      activity.scheduledFor
        ? new Date(activity.scheduledFor).toISOString().slice(0, 16)
        : ""
    );
    if (!next) return;
    await updateActivity(activity._id, {
      scheduledFor: new Date(next).toISOString(),
      status: "confirmed",
    });
  };

  const handleCreate = async (payload) => {
    await portfolioOwnerActivityApi.create(payload);
    load();
  };

  const userById = useMemo(() => {
    const map = new Map();
    for (const u of subUsers) map.set(u._id, u);
    return map;
  }, [subUsers]);

  const decorateUser = (a) => {
    const u = userById.get(
      typeof a.portfolioUserId === "string"
        ? a.portfolioUserId
        : a.portfolioUserId?.toString?.()
    );
    if (!u) return a;
    return { ...a, serviceLabel: a.serviceLabel || `${a.type} · ${u.name || u.email}` };
  };

  if (loading)
    return (
      <p className="text-gray-500 dark:text-neutral-400 px-6 py-4">Loading...</p>
    );
  if (error)
    return (
      <p className="text-red-600 dark:text-red-400 px-6 py-4">{error}</p>
    );

  return (
    <div className="space-y-6">
      <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm">
        <header className="px-6 py-4 border-b border-gray-100 dark:border-neutral-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
              Customers
            </h2>
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              {subUsers.length} account{subUsers.length === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Refresh
          </button>
        </header>
        {subUsers.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-neutral-400 px-6 py-4">
            No customers yet. They'll appear here after they sign up from your
            portfolio's Account section.
          </p>
        ) : (
          <ul className="px-6 divide-y divide-gray-100 dark:divide-neutral-700">
            {subUsers.map((u) => (
              <li key={u._id} className="py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-neutral-100 truncate">
                    {u.name || u.username || u.email}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-neutral-400 truncate">
                    {u.email}
                  </p>
                </div>
                {u.phone && (
                  <p className="text-sm text-gray-500 dark:text-neutral-400">
                    {u.phone}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm">
        <header className="px-6 py-4 border-b border-gray-100 dark:border-neutral-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
            Customer permissions
          </h2>
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            Control what your customers can do from their My Account dashboard.
          </p>
        </header>
        <div className="px-6 py-4 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allowCancellation}
              onChange={handleToggleCancellation}
              disabled={savingPermission}
              className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="flex-1">
              <span className="block font-medium text-gray-900 dark:text-neutral-100">
                Allow customers to cancel their own bookings
              </span>
              <span className="block text-sm text-gray-500 dark:text-neutral-400">
                When off, customers must contact you to cancel a pending request.
                Only pending bookings can ever be self-cancelled.
              </span>
            </span>
            {savingPermission && (
              <span className="text-xs text-gray-400 dark:text-neutral-500">
                Saving...
              </span>
            )}
          </label>
          {permissionError && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {permissionError}
            </p>
          )}
        </div>
      </section>

      <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm">
        <header className="px-6 py-4 border-b border-gray-100 dark:border-neutral-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
            Pending approvals
          </h2>
        </header>
        <PendingApprovals
          activities={pending.map(decorateUser)}
          onUpdate={updateActivity}
          onReschedule={handleReschedule}
        />
      </section>

      <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm">
        <header className="px-6 py-4 border-b border-gray-100 dark:border-neutral-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
            Upcoming
          </h2>
        </header>
        <ActivityList
          activities={upcoming.map(decorateUser)}
          emptyLabel="No upcoming activity."
          onComplete={(id) => updateActivity(id, { status: "completed" })}
        />
      </section>

      <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm">
        <header className="px-6 py-4 border-b border-gray-100 dark:border-neutral-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
            Past
          </h2>
        </header>
        <ActivityList
          activities={past.map(decorateUser)}
          emptyLabel="No past activity recorded."
        />
      </section>

      <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm">
        <header className="px-6 py-4 border-b border-gray-100 dark:border-neutral-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
            Record activity manually
          </h2>
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            Log a past visit or add a confirmed appointment on a customer's
            behalf.
          </p>
        </header>
        <ManualEntryForm
          portfolioId={portfolioId}
          subUsers={subUsers}
          onCreate={handleCreate}
        />
      </section>
    </div>
  );
}
