/** UUID v4 only. Matches the backend onboarding session check. */
const ONBOARDING_SESSION_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function onboardingSessionId(value) {
  const sessionId = String(value || "").trim().toLowerCase();
  return ONBOARDING_SESSION_RE.test(sessionId) ? sessionId : "";
}

/**
 * Return the stored onboarding session when it is a UUID v4.
 * Replace a missing or non-v4 value with crypto.randomUUID() and persist it.
 */
export function ensureOnboardingSessionId() {
  const existing = onboardingSessionId(localStorage.getItem("onboardingSessionId"));
  if (existing) {
    localStorage.setItem("onboardingSessionId", existing);
    return existing;
  }
  const id = crypto.randomUUID();
  localStorage.setItem("onboardingSessionId", id);
  return id;
}
