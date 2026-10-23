import { useState } from "react";
import { usePortfolioUser } from "@/shared/context/PortfolioUserContext";
import { portfolioUserApi } from "@/shared/api/portfolioUserApi";

export default function ProfileTab() {
  const { portfolioUser, token, refresh, portfolioId } = usePortfolioUser();
  const [form, setForm] = useState({
    name: portfolioUser?.name || "",
    username: portfolioUser?.username || "",
    phone: portfolioUser?.phone || "",
  });
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await portfolioUserApi.updateProfile(token, form);
      const updated = res.data?.user;
      if (updated) {
        localStorage.setItem(
          `portfolioUser:${portfolioId}`,
          JSON.stringify(updated)
        );
        refresh();
      }
      setStatus({ type: "success", message: "Profile updated." });
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass =
    "block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1";

  return (
    <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm">
      <header className="px-6 py-4 border-b border-gray-100 dark:border-neutral-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">Profile</h2>
        <p className="text-sm text-gray-500 dark:text-neutral-400">Your account details for this portfolio.</p>
      </header>
      <form onSubmit={onSave} className="p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Name</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Username</label>
            <input
              name="username"
              value={form.username}
              onChange={onChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              value={portfolioUser?.email || ""}
              disabled
              className="w-full px-3 py-2 border border-gray-200 dark:border-neutral-700 rounded-lg bg-gray-50 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400"
            />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={onChange}
              className={inputClass}
            />
          </div>
        </div>

        {status && (
          <p
            className={`text-sm ${
              status.type === "success"
                ? "text-green-700 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {status.message}
          </p>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  );
}
