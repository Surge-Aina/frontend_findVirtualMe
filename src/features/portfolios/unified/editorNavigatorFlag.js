/** When unset or not "true", the editor uses the legacy sections rail from main. */
export function isEditorNavigatorEnabled(env = import.meta.env) {
  return String(env.VITE_EDITOR_NAVIGATOR_ENABLED || "").toLowerCase() === "true";
}