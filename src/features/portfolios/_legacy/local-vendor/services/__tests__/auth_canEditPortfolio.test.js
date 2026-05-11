import { canEditPortfolio } from "../auth";

describe("canEditPortfolio", () => {
  test("returns false when user is null", () => {
    expect(canEditPortfolio(null, "vendor-1")).toBe(false);
  });

  test("allows admin user regardless of portfolios", () => {
    expect(
      canEditPortfolio({ role: "admin", portfolios: [] }, "any-vendor")
    ).toBe(true);
  });

  test("allows owner when portfolio id is in portfolios array (string ids)", () => {
    const user = { role: "customer", portfolios: ["vendor-1", "vendor-2"] };
    expect(canEditPortfolio(user, "vendor-2")).toBe(true);
  });

  test("allows owner when portfolio is stored as { portfolioId }", () => {
    const user = {
      role: "customer",
      portfolios: [{ portfolioId: "p-99" }],
    };
    expect(canEditPortfolio(user, "p-99")).toBe(true);
  });

  test("denies non-admin non-owner", () => {
    const user = { role: "customer", portfolios: ["vendor-1"] };
    expect(canEditPortfolio(user, "vendor-99")).toBe(false);
  });
});
