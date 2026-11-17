/**
 * Platform contact email: prefer env, else the address already used in marketing copy (Restaurant CTA).
 */
export const SUPPORT_EMAIL =
  String(import.meta.env.VITE_SUPPORT_EMAIL || "").trim() || "support@findvirtual.me";