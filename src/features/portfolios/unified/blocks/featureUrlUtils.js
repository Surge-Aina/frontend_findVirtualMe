const FORBIDDEN_QR_PREFIXES = /^(javascript:|data:|vbscript:)/i;

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
  let parsed;
  try {
    parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
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