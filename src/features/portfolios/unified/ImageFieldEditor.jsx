import { useRef, useState } from "react";
import axiosAuth from "@/shared/api/axiosAuth";
import { usePortfolioEditorId } from "./context/PortfolioEditorContext";
import { editorLabelClass, editorInputClass } from "./portfolioEditorFieldClasses";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Text URL field + upload to S3 (portfolios/&lt;id&gt;/...) for the v2 portfolio editor.
 */
export function ImageFieldEditor({ label, value, onChange, placeholder }) {
  const { portfolioId } = usePortfolioEditorId();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!portfolioId) {
      setError("Portfolio ID is missing; save and reload if this persists.");
      return;
    }

    if (file.size > MAX_BYTES) {
      setError("Image must be 5 MB or smaller.");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError("Use JPEG, PNG, WebP, or GIF.");
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const { data } = await axiosAuth.post("/api/media/s3-upload-url", {
        fileType: file.type,
        portfolioId,
        contentLength: file.size,
      });

      const { uploadUrl, publicUrl } = data;
      if (!uploadUrl || !publicUrl) {
        throw new Error("Invalid upload response");
      }

      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!putRes.ok) {
        throw new Error(`Upload failed (${putRes.status})`);
      }

      onChange(publicUrl);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        "Upload failed";
      setError(typeof msg === "string" ? msg : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const url = value || "";
  const showThumb = /^https?:\/\//i.test(url.trim());

  return (
    <div>
      <label className={editorLabelClass}>{label}</label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <input
            type="text"
            placeholder={placeholder}
            className={editorInputClass}
            value={url}
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={handleFile} />
            <button
              type="button"
              disabled={uploading || !portfolioId}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                  Uploading…
                </span>
              ) : (
                "Upload image"
              )}
            </button>
            {!portfolioId && (
              <span className="text-xs text-amber-600 dark:text-amber-400">Save portfolio first to upload.</span>
            )}
          </div>
        </div>
        {showThumb && (
          <div className="shrink-0 w-24 h-24 rounded-lg border border-gray-200 dark:border-neutral-600 overflow-hidden bg-gray-50 dark:bg-neutral-800">
            <img
              src={url.trim()}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}
      </div>
      {error && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}
