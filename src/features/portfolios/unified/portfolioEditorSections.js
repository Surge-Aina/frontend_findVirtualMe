import { BLOCK_LABELS } from "./portfolioEditorConfig";

/** Matches backend `MAX_PORTFOLIO_SECTIONS` in portfolio.service.js */
export const MAX_PORTFOLIO_SECTIONS = 24;

export const SECTION_DISPLAY_LABEL_KEY = "editorDisplayLabel";

export function getSectionDisplayLabel(section) {
  if (!section) return "";
  const custom = section.data?.[SECTION_DISPLAY_LABEL_KEY];
  if (typeof custom === "string" && custom.trim()) {
    return custom.trim();
  }
  return BLOCK_LABELS[section.type] || section.type || "Section";
}

export function getSectionTypeHint(section) {
  if (!section?.type) return "";
  const base = BLOCK_LABELS[section.type] || section.type;
  const custom = section.data?.[SECTION_DISPLAY_LABEL_KEY];
  if (typeof custom === "string" && custom.trim() && base !== custom.trim()) {
    return base;
  }
  return "";
}