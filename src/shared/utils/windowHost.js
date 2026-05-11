/** Isolated for tests (JSDOM does not allow redefining window.location). */
export function getBrowserHostname() {
  if (typeof window === "undefined") return "";
  return window.location.hostname;
}
