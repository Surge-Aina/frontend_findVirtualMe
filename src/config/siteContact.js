/**
 * Platform contact email: prefer env, else the address in the Termly privacy policy (surgeaina@gmail.com).
 */
export const SUPPORT_EMAIL =
  String(import.meta.env.VITE_SUPPORT_EMAIL || "").trim() || "surgeaina@gmail.com";