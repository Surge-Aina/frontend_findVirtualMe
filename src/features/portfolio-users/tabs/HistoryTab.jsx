import { useEffect, useMemo, useState } from "react";
import { usePortfolioUser } from "@/shared/context/PortfolioUserContext";
import { portfolioUserApi } from "@/shared/api/portfolioUserApi";
import { portfolioApi } from "@/shared/api/portfolioApi";

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

const STATUS_STYLES = {
  pending:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
  confirmed:
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/30",
  completed:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30",
  declined:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30",
  cancelled:
    "bg-gray-100 text-gray-700 border-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700",
};

function StatusBadge({ status }) {
  const className = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded border ${className}`}>
      {status}
    </span>
  );
}

function ActivityRow({ activity, onCancel, cancelling, allowCancel = false }) {
  const canCancel =
    allowCancel && activity.status === "pending" && typeof onCancel === "function";
  return (
    <li className="py-3 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-gray-900 dark:text-neutral-100 truncate">
            {activity.serviceLabel || activity.type || "Activity"}
          </p>
          <StatusBadge status={activity.status} />
        </div>
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          {activity.scheduledFor
            ? `Scheduled for ${formatDate(activity.scheduledFor)}`
            : activity.completedAt
              ? `Completed ${formatDate(activity.completedAt)}`
              : `Created ${formatDate(activity.createdAt)}`}
        </p>
        {activity.notes && (
          <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">{activity.notes}</p>
        )}
      </div>
      {canCancel && (
        <button
          type="button"
          onClick={() => onCancel(activity._id)}
          disabled={cancelling}
          className="text-sm text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
        >
          {cancelling ? "Cancelling..." : "Cancel booking"}
        </button>
      )}
    </li>
  );
}

export default function HistoryTab() {
  const { token, portfolioId } = usePortfolioUser();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [allowCancellation, setAllowCancellation] = useState(false);

  useEffect(() => {
    if (!portfolioId) return;
    let cancelled = false;
    portfolioApi
      .getById(portfolioId)
      .then((res) => {
        if (cancelled) return;
        setAllowCancellation(
          Boolean(res.data?.subUserSettings?.allowBookingCancellation)
        );
      })
      .catch(() => {
        if (!cancelled) setAllowCancellation(false);
      });
    return () => {
      cancelled = true;
    };
  }, [portfolioId]);

  const loadActivities = () => {
    if (!token) return () => {};
    let cancelled = false;
    setLoading(true);
    portfolioUserApi
      .listMyActivities(token)
      .then((res) => {
        if (!cancelled) setActivities(res.data.activities || []);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err?.response?.data?.error || "Failed to load history");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  };

  useEffect(() => {
    return loadActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCancel = async (id) => {
    if (!token || !id) return;
    setActionError(null);
    setCancellingId(id);
    try {
      await portfolioUserApi.cancelMyActivity(token, id);
      setActivities((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: "cancelled" } : a))
      );
    } catch (err) {
      setActionError(
        err?.response?.data?.error || "Could not cancel booking."
      );
    } finally {
      setCancellingId(null);
    }
  };

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const up = [];
    const pa = [];
    for (const a of activities) {
      const when = a.scheduledFor ? new Date(a.scheduledFor).getTime() : null;
      const isPastStatus = ["completed", "declined", "cancelled"].includes(a.status);
      if (isPastStatus || (when !== null && when < now)) {
        pa.push(a);
      } else {
        up.push(a);
      }
    }
    return { upcoming: up, past: pa };
  }, [activities]);

  if (loading) {
    return <p className="text-gray-500 dark:text-neutral-400">Loading history...</p>;
  }
  if (error) {
    return <p className="text-red-600 dark:text-red-400">{error}</p>;
  }

  return (
    <div className="space-y-6">
      {actionError && (
        <p className="text-sm text-red-600 dark:text-red-400">{actionError}</p>
      )}
      <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm">
        <header className="px-6 py-4 border-b border-gray-100 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">Upcoming</h2>
        </header>
        <ul className="px-6 divide-y divide-gray-100 dark:divide-neutral-800">
          {upcoming.length === 0 ? (
            <li className="py-4 text-gray-500 dark:text-neutral-400 text-sm">Nothing scheduled.</li>
          ) : (
            upcoming.map((a) => (
              <ActivityRow
                key={a._id}
                activity={a}
                onCancel={handleCancel}
                cancelling={cancellingId === a._id}
                allowCancel={allowCancellation}
              />
            ))
          )}
        </ul>
      </section>

      <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm">
        <header className="px-6 py-4 border-b border-gray-100 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">Past</h2>
        </header>
        <ul className="px-6 divide-y divide-gray-100 dark:divide-neutral-800">
          {past.length === 0 ? (
            <li className="py-4 text-gray-500 dark:text-neutral-400 text-sm">No past activity yet.</li>
          ) : (
            past.map((a) => <ActivityRow key={a._id} activity={a} />)
          )}
        </ul>
      </section>
    </div>
  );
}
