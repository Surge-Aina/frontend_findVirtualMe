import { isPortfolioDraftsDisabledError } from "../portfolioApi";

describe("isPortfolioDraftsDisabledError", () => {
  it("detects DRAFTS_DISABLED", () => {
    expect(
      isPortfolioDraftsDisabledError({
        response: { status: 404, data: { code: "DRAFTS_DISABLED" } },
      })
    ).toBe(true);
  });

  it("returns false for other errors", () => {
    expect(isPortfolioDraftsDisabledError({ response: { status: 500 } })).toBe(false);
    expect(isPortfolioDraftsDisabledError({ response: { status: 404, data: { code: "OTHER" } } })).toBe(
      false
    );
  });
});