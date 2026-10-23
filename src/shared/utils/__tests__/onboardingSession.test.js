import { ensureOnboardingSessionId, onboardingSessionId } from "../onboardingSession";

describe("onboarding session id", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("accepts a UUID v4 and rejects other versions and legacy keys", () => {
    expect(onboardingSessionId("550e8400-e29b-41d4-a716-446655440000")).toBe(
      "550e8400-e29b-41d4-a716-446655440000"
    );
    expect(onboardingSessionId("550E8400-E29B-41D4-A716-446655440000")).toBe(
      "550e8400-e29b-41d4-a716-446655440000"
    );
    expect(onboardingSessionId("550e8400-e29b-11d4-a716-446655440000")).toBe("");
    expect(onboardingSessionId("session_1710000000000")).toBe("");
  });

  test("keeps a stored v4", () => {
    localStorage.setItem("onboardingSessionId", "550e8400-e29b-41d4-a716-446655440000");
    expect(ensureOnboardingSessionId()).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  test("replaces a stored non-v4 with crypto.randomUUID()", () => {
    const generated = "123e4567-e89b-42d3-a456-426614174000";
    const spy = jest.spyOn(crypto, "randomUUID").mockReturnValue(generated);
    localStorage.setItem("onboardingSessionId", "session_1710000000000");

    expect(ensureOnboardingSessionId()).toBe(generated);
    expect(localStorage.getItem("onboardingSessionId")).toBe(generated);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test("creates a v4 when nothing is stored", () => {
    const id = ensureOnboardingSessionId();
    expect(onboardingSessionId(id)).toBe(id);
    expect(localStorage.getItem("onboardingSessionId")).toBe(id);
  });
});
