import { useState } from "react";

export default function ConfirmActionModal({ title, body, confirmLabel, onConfirm, onClose }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setPending(true);
    setError("");
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err?.message || "Something went wrong.");
      setPending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 min-h-screen px-4"
      style={{ backdropFilter: "blur(2px)" }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative max-w-md w-full bg-white border border-slate-300 rounded-2xl shadow-2xl px-6 py-8"
      >
        <h2 id="confirm-dialog-title" className="text-xl font-semibold text-slate-800">
          {title}
        </h2>
        <p className="mt-3 text-sm text-slate-600">{body}</p>
        {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={pending}
            className="px-5 py-2 rounded bg-gray-400 text-white hover:bg-red-500 transition-colors duration-300 disabled:opacity-60"
          >
            {pending ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
