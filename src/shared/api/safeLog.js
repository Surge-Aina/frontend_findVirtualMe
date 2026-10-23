function endpointPath(url) {
  const raw = String(url || "").split("#")[0].split("?")[0];
  if (!raw) return "unknown";
  if (/^https?:\/\//i.test(raw)) {
    try {
      return new URL(raw).pathname || "/";
    } catch {
      return "unknown";
    }
  }
  return raw;
}

/**
 * Log a failed request without headers, tokens, passwords, or bodies.
 * Output is a single string: label, method, path, status.
 */
export function logApiError(error, label = "Request failed") {
  const method = String(error?.config?.method || "GET").toUpperCase();
  const path = endpointPath(error?.config?.url);
  const status = error?.response?.status ?? "no-status";
  console.error(`${label}: ${method} ${path} ${status}`);
}
