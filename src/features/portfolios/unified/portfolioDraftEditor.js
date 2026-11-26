import { SECTION_DISPLAY_LABEL_KEY } from "./portfolioEditorSections";

export function workingPortfolioFromDraftDetail({ published, draft, hasDraft }) {
  if (!published) return null;
  if (!hasDraft || !draft) {
    return JSON.parse(JSON.stringify(published));
  }

  return {
    ...published,
    _id: published._id || draft.portfolioId,
    title: draft.title ?? published.title,
    slug: draft.slug ?? published.slug,
    visibility: draft.visibility ?? published.visibility,
    hideBranding: draft.hideBranding ?? published.hideBranding,
    socialLinks: draft.socialLinks ?? published.socialLinks,
    themeId: draft.themeId ?? published.themeId,
    themeTokens: draft.themeTokens ?? published.themeTokens,
    layoutMode: draft.layoutMode ?? published.layoutMode,
    pageBannerDefaults: draft.pageBannerDefaults ?? published.pageBannerDefaults,
    navBrand: draft.navBrand ?? published.navBrand,
    subUserSettings: draft.subUserSettings ?? published.subUserSettings,
    sections: Array.isArray(draft.sections) ? draft.sections : published.sections,
  };
}

export function draftMetaFromDetail({ draft, hasDraft }) {
  if (!hasDraft || !draft) {
    return {
      hasUnpublishedDraft: false,
      source: "owner",
      approvalState: null,
    };
  }
  return {
    hasUnpublishedDraft: true,
    source: draft.source || "owner",
    approvalState: draft.approvalState || null,
  };
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

export function sectionDataForComparable(data) {
  const next = { ...(data || {}) };
  if (next[SECTION_DISPLAY_LABEL_KEY] === "") {
    delete next[SECTION_DISPLAY_LABEL_KEY];
  }
  return next;
}