import { friendlyPhoneLoginError } from "../phoneLoginErrors";

function axiosError(status, data) {
  return { response: { status, data } };
}

describe("friendlyPhoneLoginError", () => {
  it("maps rate limit middleware errors", () => {
    expect(
      friendlyPhoneLoginError(axiosError(429, { error: "Too many requests" })),
    ).toMatch(/wait a minute/i);
  });

  it("maps country not supported", () => {
    expect(
      friendlyPhoneLoginError(
        axiosError(400, { code: "PHONE_COUNTRY_NOT_SUPPORTED", message: "Phone number country is not supported" }),
      ),
    ).toMatch(/not available for this country/i);
  });

  it("maps invalid number", () => {
    expect(friendlyPhoneLoginError(axiosError(400, { message: "Invalid request" }))).toMatch(/valid phone/i);
  });

  it("maps verify failures", () => {
    expect(friendlyPhoneLoginError(axiosError(400, { message: "Unable to verify code" }))).toMatch(/did not work/i);
  });

  it("maps regional caps", () => {
    expect(
      friendlyPhoneLoginError(axiosError(429, { message: "Too many verification requests for this region" })),
    ).toMatch(/region/i);
  });
});