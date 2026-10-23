const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/;
const PHOTOGRAPHER_TYPES = new Set(["photographer", "photography"]);

export function isPortfolioObjectId(value) {
  return typeof value === "string" && OBJECT_ID_RE.test(value.trim());
}

function entryType(entry) {
  if (!entry || typeof entry !== "object") return "";
  return String(entry.portfolioType || entry.template || entry.type || "")
    .trim()
    .toLowerCase();
}

function entryId(entry) {
  if (typeof entry === "string") return entry.trim();
  const id = entry?.portfolioId || entry?._id || entry?.id || "";
  return String(id).trim();
}

function storedPortfolioEntries() {
  if (typeof localStorage === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem("userPortfolios") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function portfolioEntries(user) {
  if (Array.isArray(user?.portfolios) && user.portfolios.length) return user.portfolios;
  return storedPortfolioEntries();
}

/**
 * Photographer writes accept an owned photographer portfolio ObjectId,
 * or the literal "default" for a sole legacy owner.
 * A known photographer ObjectId is always preferred.
 */
export function resolvePhotographerPortfolioId(contextId, user) {
  const stored = typeof contextId === "string" ? contextId.trim() : "";
  const photographerIds = portfolioEntries(user)
    .filter((entry) => PHOTOGRAPHER_TYPES.has(entryType(entry)))
    .map(entryId)
    .filter(isPortfolioObjectId);

  if (isPortfolioObjectId(stored) && photographerIds.includes(stored)) return stored;
  if (photographerIds.length > 0) return photographerIds[0];
  if (isPortfolioObjectId(stored)) return stored;
  return "default";
}
