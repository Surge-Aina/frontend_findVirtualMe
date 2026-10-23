import { useState } from "react";

async function copySecret(secret) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(secret);
    return;
  }
  const field = document.createElement("textarea");
  field.value = secret;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.left = "-9999px";
  document.body.appendChild(field);
  field.select();
  document.execCommand("copy");
  document.body.removeChild(field);
}

export default function SecretRevealModal({ title, warning, secret, note, onClose }) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const handleCopy = async () => {
    try {
      await copySecret(secret);
      setCopied(true);
      setCopyFailed(false);
    } catch {
      setCopied(false);
      setCopyFailed(true);
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
        aria-labelledby="secret-dialog-title"
        className="relative max-w-lg w-full bg-white border border-slate-300 rounded-2xl shadow-2xl px-6 py-8"
      >
        <h2 id="secret-dialog-title" className="text-xl font-semibold text-slate-800">
          {title}
        </h2>
        <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {warning}
        </div>
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 font-mono text-sm text-gray-900 break-all">
          {secret}
        </div>
        {note ? <p className="mt-3 text-sm text-slate-600">{note}</p> : null}
        {copyFailed ? (
          <p className="mt-3 text-sm text-red-500">Copy failed. Select the key and copy it manually.</p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            I have stored this
          </button>
        </div>
      </div>
    </div>
  );
}
