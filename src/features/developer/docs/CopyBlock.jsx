import { useState } from "react";

export default function CopyBlock({ label, text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-100">
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-gray-200">
        <span className="text-xs font-medium text-gray-700">{label}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-white transition text-xs"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="px-4 py-3 text-sm text-gray-900 overflow-x-auto whitespace-pre-wrap break-all">{text}</pre>
    </div>
  );
}
