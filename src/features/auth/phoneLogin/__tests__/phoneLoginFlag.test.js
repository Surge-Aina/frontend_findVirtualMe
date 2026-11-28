import { isPhoneLoginEnabled } from "../phoneLoginFlag";

describe("isPhoneLoginEnabled", () => {
  it("is off when unset", () => {
    expect(isPhoneLoginEnabled({})).toBe(false);
    expect(isPhoneLoginEnabled({ VITE_PHONE_LOGIN_ENABLED: "" })).toBe(false);
  });

  it("is on only when env is true", () => {
    expect(isPhoneLoginEnabled({ VITE_PHONE_LOGIN_ENABLED: "true" })).toBe(true);
    expect(isPhoneLoginEnabled({ VITE_PHONE_LOGIN_ENABLED: "TRUE" })).toBe(true);
    expect(isPhoneLoginEnabled({ VITE_PHONE_LOGIN_ENABLED: "1" })).toBe(false);
  });
});