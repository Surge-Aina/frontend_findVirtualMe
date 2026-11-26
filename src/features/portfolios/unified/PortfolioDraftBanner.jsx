import { Link } from "react-router-dom";
import { FaGlobeAmericas, FaRocket } from "react-icons/fa";
import {
  formatApprovalState,
  formatDraftSourceLabel,
} from "./portfolioDraftEditor";

export function PortfolioDraftBanner({
  portfolioId,
  draftsEnabled,
  hasUnpublishedDraft,
  draftSource,
  approvalState,
  publishing,
  onPublish,
}) {
  if (!draftsEnabled) return null;

  const approvalLabel = formatApprovalState(approvalState);
  const sourceLabel = formatDraftSourceLabel(draftSource);
  const showAiPending = draftSource === "ai" && approvalState === "pending_owner";

  return (
    <div className="border-b border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
            {hasUnpublishedDraft ? "Draft — not live yet" : "Draft mode — saves update your draft"}
          </p>
          <p className="text-xs text-amber-800/90 dark:text-amber-200/80">
            Visitors still see the last published version until you publish.
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-white/70 dark:bg-neutral-900/50 px-2 py-0.5 text-[11px] font-medium text-amber-900 dark:text-amber-100">
              Source: {sourceLabel}
              {approvalLabel ? ` · ${approvalLabel}` : ""}
            </span>
          </p>
          {showAiPending ? (
            <p className="text-xs text-amber-900 dark:text-amber-100">
              Review this AI-proposed draft, then publish when you are ready.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            to={`/portfolios/view/${portfolioId}`}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-neutral-900 text-amber-900 dark:text-amber-100 text-sm hover:bg-amber-100/50 dark:hover:bg-neutral-800"
          >
            <FaGlobeAmericas className="shrink-0" />
            View live site
          </Link>
          <button
            type="button"
            onClick={onPublish}
            disabled={publishing}
            aria-label="Publish draft to live site"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
          >
            <FaRocket className="shrink-0" />
            {publishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}