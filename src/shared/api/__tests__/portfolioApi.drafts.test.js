import {
  isPortfolioDraftsDisabledError,
  isSiteDraftsProbeSkipped,
  portfolioApi,
  resetSiteDraftsProbeCache,
} from "../portfolioApi";

jest.mock("../axiosAuth", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

import axiosAuth from "../axiosAuth";

describe("getDraft probe cache", () => {
  beforeEach(() => {
    resetSiteDraftsProbeCache();
    axiosAuth.get.mockReset();
  });

  it("skips further GET /draft calls after DRAFTS_DISABLED", async () => {
    axiosAuth.get.mockRejectedValue({
      response: { status: 404, data: { code: "DRAFTS_DISABLED" } },
    });

    await expect(portfolioApi.getDraft("p1")).rejects.toMatchObject({
      response: { data: { code: "DRAFTS_DISABLED" } },
    });
    expect(isSiteDraftsProbeSkipped()).toBe(true);
    axiosAuth.get.mockClear();

    await expect(portfolioApi.getDraft("p2")).rejects.toMatchObject({
      response: { data: { code: "DRAFTS_DISABLED" } },
    });
    expect(axiosAuth.get).not.toHaveBeenCalled();
  });
});

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