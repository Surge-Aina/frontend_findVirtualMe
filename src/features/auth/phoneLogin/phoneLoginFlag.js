/** Opt-in: phone OTP sign-in UI is hidden unless VITE_PHONE_LOGIN_ENABLED is "true". */
export function isPhoneLoginEnabled(env = import.meta.env) {
  return String(env.VITE_PHONE_LOGIN_ENABLED || "").toLowerCase() === "true";
}