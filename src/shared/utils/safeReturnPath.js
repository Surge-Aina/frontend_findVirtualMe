// Same-origin return paths only. Reject protocol-relative and backslash
// forms that browsers treat as a different host.
export function safeReturnPath(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return null;
  if (/[\\\s]/.test(value)) return null;
  let url;
  try {
    url = new URL(value, "https://findvirtual.me");
  } catch {
    return null;
  }
  if (url.origin !== "https://findvirtual.me") return null;
  if (url.username || url.password) return null;
  if (!url.pathname.startsWith("/") || url.pathname.startsWith("//")) return null;
  let decoded = url.pathname;
  try {
    decoded = decodeURIComponent(url.pathname);
  } catch {
    return null;
  }
  if (decoded.startsWith("//") || decoded.includes("\\") || decoded.includes("//")) return null;
  return `${url.pathname}${url.search}${url.hash}`;
}

export function consumePostLoginPath() {
  try {
    const raw = sessionStorage.getItem("postLoginPath");
    sessionStorage.removeItem("postLoginPath");
    if (!raw) return "/profile";
    const parsed = JSON.parse(raw);
    if (parsed?.exp && Date.now() > parsed.exp) return "/profile";
    return safeReturnPath(parsed?.path) || "/profile";
  } catch {
    sessionStorage.removeItem("postLoginPath");
    return "/profile";
  }
}
