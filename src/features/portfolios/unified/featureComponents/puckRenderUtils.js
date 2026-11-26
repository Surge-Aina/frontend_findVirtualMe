/** Keys Puck injects at render time that must not be spread onto site blocks. */
const PUCK_INTERNAL_KEYS = new Set(["puck", "editMode"]);

/**
 * @param {Record<string, unknown>} props Puck component render props (may include `id`, `puck`, …)
 * @returns {Record<string, unknown>}
 */
export function stripPuckRenderProps(props) {
  if (!props || typeof props !== "object" || Array.isArray(props)) return {};
  const out = {};
  for (const [key, value] of Object.entries(props)) {
    if (key === "id" || PUCK_INTERNAL_KEYS.has(key)) continue;
    out[key] = value;
  }
  return out;
}