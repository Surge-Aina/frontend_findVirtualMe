import { mergeNavBrandDefaults } from "./PortfolioNavBrand";
import {
  SECTION_DISPLAY_LABEL_KEY,
  sectionDataForPersistenceCompare,
} from "./portfolioEditorSections";
import { isEditorNavigatorEnabled } from "./editorNavigatorFlag";

/** Fields returned on draft-mode PATCH / section CRUD (overlay only). */
export const DRAFT_PORTFOLIO_OVERLAY_KEYS = [
  "title",
  "slug",
  "visibility",
  "hideBranding",
  "socialLinks",
  "themeId",
  "themeTokens",
  "layoutMode",
  "pageBannerDefaults",
  "navBrand",
  "subUserSettings",
  "sections",
];

export function mergeDraftMutationPortfolio(current, incoming) {
  if (!incoming) return current ?? null;
  if (!current) return { ...incoming };
  const merged = { ...current };
  for (const key of DRAFT_PORTFOLIO_OVERLAY_KEYS) {
    if (incoming[key] !== undefined) {
      merged[key] = incoming[key];
    }
  }
  if (incoming._id !== undefined) {
    merged._id = incoming._id;
  }
  return merged;
}

export function extractDraftComparable(doc) {
  if (!doc) return null;
  const includeEditorLabel = isEditorNavigatorEnabled();
  return {
    title: doc.title || "",
    socialLinks: doc.socialLinks || {},
    sections: (doc.sections || []).map((section) => ({
      _id: section._id || "",
      type: section.type,
      order: section.order,
      visible: section.visible !== false,
      data: sectionDataForPersistenceCompare(section.data, { includeEditorLabel }),
    })),
    themeId: doc.themeId || "",
    themeTokens: doc.themeTokens || {},
    layoutMode: doc.layoutMode || "",
    pageBannerDefaults: doc.pageBannerDefaults || {},
    navBrand: mergeNavBrandDefaults(doc.navBrand),
  };
}

export function draftContentEquals(a, b) {
  return (
    JSON.stringify(extractDraftComparable(a)) === JSON.stringify(extractDraftComparable(b))
  );
}

export function workingPortfolioFromDraftDetail({ published, draft, hasDraft }) {
  if (!published) return null;
  if (!hasDraft || !draft) {
    return JSON.parse(JSON.stringify(published));
  }

  return mergeDraftMutationPortfolio(published, {
    ...draft,
    _id: published._id || draft.portfolioId,
  });
}

export function draftMetaFromDetail({ published, draft, hasDraft }) {
  if (!hasDraft || !draft) {
    return {
      hasUnpublishedDraft: false,
      source: "owner",
      approvalState: null,
    };
  }
  const source = draft.source || "owner";
  const approvalState = draft.approvalState || null;
  const differsFromPublished = published ? !draftContentEquals(published, draft) : true;
  const hasUnpublishedDraft =
    approvalState !== "approved" || differsFromPublished;

  return {
    hasUnpublishedDraft,
    source,
    approvalState,
  };
}

export function draftMetaFromMutationResponse(savedPortfolio, publishedBaseline) {
  if (!savedPortfolio?.draftMode) {
    return { hasUnpublishedDraft: false, source: "owner", approvalState: null };
  }
  const draft = savedPortfolio.workingDraft || savedPortfolio;
  return draftMetaFromDetail({
    published: publishedBaseline,
    draft,
    hasDraft: true,
  });
}

export function formatDraftSourceLabel(source) {
  switch (source) {
    case "ai":
      return "AI";
    case "api":
      return "API";
    case "owner":
    default:
      return "Owner";
  }
}

export function formatApprovalState(state) {
  if (!state) return null;
  switch (state) {
    case "pending_owner":
      return "Pending your approval";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    default:
      return state;
  }
}