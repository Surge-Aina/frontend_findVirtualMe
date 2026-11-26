const FORBIDDEN_QR_PREFIXES = /^(javascript:|data:|vbscript:)/i;
const SCHEME_PREFIX = /^[a-z][a-z0-9+.-]*:/i;
const PATH_SEGMENT = /^[a-zA-Z0-9_.~%-]*$/;
const PATH_QUERY = /^[a-zA-Z0-9&=%_.~+-]*$/;

/**
 * @param {string} path
 * @returns {boolean}
 */
export function validateSameSitePath(path) {
  if (typeof path !== "string" || path.length > 512) return false;
  if (!path.startsWith("/") || path.startsWith("//")) return false;
  if (path.length < 2 || path[1] === "/") return false;

  const qIdx = path.indexOf("?");
  const pathPart = qIdx >= 0 ? path.slice(0, qIdx) : path;
  const query = qIdx >= 0 ? path.slice(qIdx + 1) : null;

  const segments = pathPart.split("/").slice(1);
  for (const seg of segments) {
    if (seg === ".." || seg === ".") return false;
    if (!PATH_SEGMENT.test(seg)) return false;
  }

  if (query !== null) {
    if (query.length > 512) return false;
    if (!PATH_QUERY.test(query)) return false;
  }
  return true;
}

/**
 * @param {string} href
 * @returns {string|null}
 */
export function sanitizeHttpHref(href) {
  if (href === undefined || href === null) return null;
  const trimmed = String(href).trim();
  if (!trimmed || FORBIDDEN_QR_PREFIXES.test(trimmed) || trimmed.startsWith("//")) {
    return null;
  }

  let toParse = trimmed;
  if (SCHEME_PREFIX.test(trimmed)) {
    toParse = trimmed;
  } else if (trimmed.startsWith("/")) {
    return null;
  } else {
    toParse = `https://${trimmed}`;
  }

  let parsed;
  try {
    parsed = new URL(toParse);
  } catch {
    return null;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  if (!parsed.hostname) return null;
  return parsed.href;
}

/**
 * Resolves qrCode section target to a string safe for QR encoding (http(s) only).
 * @param {string} target
 * @param {() => string} sitePublicUrl
 */
export function resolveQrEncodeTarget(target, sitePublicUrl) {
  const raw = String(target ?? "").trim();
  if (!raw) {
    const site = sitePublicUrl();
    return sanitizeHttpHref(site) || "";
  }
  if (raw.startsWith("/")) {
    if (raw.startsWith("//")) return "";
    if (!validateSameSitePath(raw)) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    if (!origin) return "";
    try {
      const resolved = new URL(raw, origin);
      if (resolved.protocol !== "http:" && resolved.protocol !== "https:") return "";
      return resolved.href;
    } catch {
      return "";
    }
  }
  return sanitizeHttpHref(raw) || "";
}

export function clampQrSize(size) {
  const num = Number(size);
  if (!Number.isFinite(num)) return 160;
  return Math.min(512, Math.max(64, Math.round(num)));
}

export function defaultSitePublicUrl() {
  if (typeof window === "undefined") return "";
  const { origin, pathname, search } = window.location;
  return `${origin}${pathname || "/"}${search || ""}`;
}