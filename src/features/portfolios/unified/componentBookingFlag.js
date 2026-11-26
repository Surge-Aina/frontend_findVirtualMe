/** Public + editor gate for the BookingRequest Puck block (separate from VITE_EDITOR_COMPONENTS_ENABLED). */
export function isComponentBookingEnabled(env = import.meta.env) {
  return String(env.VITE_COMPONENT_BOOKING_ENABLED || "").toLowerCase() === "true";
}