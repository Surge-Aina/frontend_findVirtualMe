import { useEffect, useState } from "react";
import axiosAuth from "@/shared/api/axiosAuth";

function voucherLabel(entry) {
  const name = entry?.voucherId?.name || "Voucher";
  const type = entry?.voucherId?.type ? ` (${entry.voucherId.type})` : "";
  return `${name}${type}`;
}

export default function VoucherIdPickerField({ value, onChange, field }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    axiosAuth
      .get("/api/vouchers/my")
      .then((res) => {
        if (cancelled) return;
        const active = (res.data || []).filter((v) => v.status === "active");
        setOptions(active);
        setError("");
      })
      .catch(() => {
        if (!cancelled) {
          setOptions([]);
          setError("Could not load vouchers");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-neutral-200 mb-1">
        {field?.label || "User voucher"}
      </label>
      {loading ? (
        <p className="text-sm text-gray-500">Loading active vouchers…</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <select
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-900"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select a voucher</option>
          {options.map((entry) => (
            <option key={entry._id} value={entry._id}>
              {voucherLabel(entry)}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}