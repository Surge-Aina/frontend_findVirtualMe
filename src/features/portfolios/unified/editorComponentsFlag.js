/** When unset or not "true", feature-component (Puck) UI is hidden. */
export function isEditorComponentsEnabled(env = import.meta.env) {
  return String(env.VITE_EDITOR_COMPONENTS_ENABLED || "").toLowerCase() === "true";
}