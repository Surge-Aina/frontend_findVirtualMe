import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { portfolioApi } from "@/shared/api/portfolioApi";
import { formatDraftSourceLabel } from "./portfolioDraftEditor";

function formatWhen(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

export function PortfolioVersionHistoryPanel({ portfolioId, draftsEnabled, onDraftRestored }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [reverting, setReverting] = useState(false);

  const loadVersions = useCallback(async () => {
    if (!portfolioId || !draftsEnabled) return;
    setLoading(true);
    try {
      const res = await portfolioApi.listVersions(portfolioId);
      setVersions(Array.isArray(res.data?.versions) ? res.data.versions : []);
    } catch {
      toast.error("Could not load version history");
      setVersions([]);
    } finally {
      setLoading(false);
    }
  }, [draftsEnabled, portfolioId]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  if (!draftsEnabled) return null;

  const openPreview = async (versionNumber) => {
    setPreviewLoading(true);
    try {
      const res = await portfolioApi.getVersion(portfolioId, versionNumber);
      setPreview(res.data?.version || null);
    } catch {
      toast.error("Could not load that version");
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleRevert = async (versionNumber) => {
    const message =
      `Restore version ${versionNumber} into your working draft? ` +
      "The live site will not change until you publish.";
    if (!window.confirm(message)) return;

    setReverting(true);
    try {
      const res = await portfolioApi.revertVersion(portfolioId, versionNumber);
      await onDraftRestored?.(res.data);
      await loadVersions();
      toast.success(`Version ${versionNumber} loaded into your draft`);
      setPreview(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to restore version");
    } finally {
      setReverting(false);
    }
  };

  const previewSnapshot = preview?.snapshot;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-neutral-100 text-sm">Version history</h3>
        <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
          Published snapshots (newest first). Preview or restore into your draft, then publish to go
          live.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-neutral-400">Loading versions…</p>
      ) : versions.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-neutral-400">No published versions yet.</p>
      ) : (
        <ul className="space-y-2" aria-label="Published versions">
          {versions.map((v) => (
            <li
              key={v.versionNumber}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 dark:border-neutral-600 px-3 py-2 text-sm"
            >
              <span className="font-medium text-gray-900 dark:text-neutral-100 tabular-nums">
                v{v.versionNumber}
              </span>
              <span className="text-xs text-gray-500 dark:text-neutral-400">
                {formatWhen(v.publishedAt)}
              </span>
              <span className="text-xs text-gray-500 dark:text-neutral-400">
                {formatDraftSourceLabel(v.source)}
              </span>
              <span className="flex-1" />
              <button
                type="button"
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                onClick={() => openPreview(v.versionNumber)}
              >
                Preview
              </button>
              <button
                type="button"
                disabled={reverting}
                className="text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline disabled:opacity-50"
                onClick={() => handleRevert(v.versionNumber)}
              >
                Restore to draft
              </button>
            </li>
          ))}
        </ul>
      )}

      {(preview || previewLoading) && (
        <div className="rounded-lg border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-800/80 p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-neutral-100">
              {previewLoading
                ? "Loading preview…"
                : `Preview — version ${preview?.versionNumber}`}
            </h4>
            <button
              type="button"
              className="text-xs text-gray-500 hover:text-gray-800 dark:hover:text-neutral-200"
              onClick={() => setPreview(null)}
            >
              Close
            </button>
          </div>
          {previewSnapshot ? (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-neutral-300">
              <div>
                <dt className="text-gray-400">Title</dt>
                <dd className="font-medium text-gray-800 dark:text-neutral-100 truncate">
                  {previewSnapshot.title || "Untitled"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-400">Visibility</dt>
                <dd className="capitalize">{previewSnapshot.visibility || "private"}</dd>
              </div>
              <div>
                <dt className="text-gray-400">Sections</dt>
                <dd>{(previewSnapshot.sections || []).length}</dd>
              </div>
              <div>
                <dt className="text-gray-400">Published</dt>
                <dd>{formatWhen(preview?.publishedAt)}</dd>
              </div>
            </dl>
          ) : null}
          {preview && !previewLoading ? (
            <button
              type="button"
              disabled={reverting}
              className="text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline disabled:opacity-50"
              onClick={() => handleRevert(preview.versionNumber)}
            >
              Restore this version to draft
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}