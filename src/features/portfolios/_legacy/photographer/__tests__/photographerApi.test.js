import axiosAuth from "@/shared/api/axiosAuth";
import {
  resolvePhotographerPortfolioId,
  reorderPhotographerPhotos,
  putPhotographerSetting,
  deletePhotographerPhoto,
} from "../photographerApi";

jest.mock("@/shared/api/axiosAuth", () => ({
  __esModule: true,
  default: { put: jest.fn(), delete: jest.fn(), post: jest.fn() },
}));

const OWNED_ID = "507f1f77bcf86cd799439011";
const OTHER_ID = "507f191e810c19729de860ea";

describe("photographer portfolio writes", () => {
  beforeEach(() => {
    axiosAuth.put.mockReset();
    axiosAuth.delete.mockReset();
    localStorage.clear();
  });

  test("uses an owned photographer ObjectId ahead of the legacy default", () => {
    const id = resolvePhotographerPortfolioId("default", {
      portfolios: [{ portfolioId: OWNED_ID, portfolioType: "photographer" }],
    });
    expect(id).toBe(OWNED_ID);
  });

  test("sends a known photographer ObjectId instead of a non-id bucket", () => {
    const id = resolvePhotographerPortfolioId("studio-live", {
      portfolios: [{ portfolioId: OWNED_ID, portfolioType: "photography" }],
    });
    expect(id).toBe(OWNED_ID);
  });

  test("keeps the context id when it is one of the owned photographer portfolios", () => {
    const id = resolvePhotographerPortfolioId(OTHER_ID, {
      portfolios: [
        { portfolioId: OWNED_ID, portfolioType: "photographer" },
        { portfolioId: OTHER_ID, portfolioType: "photographer" },
      ],
    });
    expect(id).toBe(OTHER_ID);
  });

  test("keeps a context ObjectId and drops any other string", () => {
    expect(resolvePhotographerPortfolioId(OTHER_ID, null)).toBe(OTHER_ID);
    expect(resolvePhotographerPortfolioId("studio-live", null)).toBe("default");
    expect(resolvePhotographerPortfolioId("abc123", null)).toBe("default");
  });

  test("reads a stored photographer portfolio when the user object is not loaded", () => {
    localStorage.setItem(
      "userPortfolios",
      JSON.stringify([{ portfolioId: OWNED_ID, portfolioType: "photographer" }])
    );
    expect(resolvePhotographerPortfolioId("default", null)).toBe(OWNED_ID);
  });

  test("settings include portfolioId in the body", async () => {
    await putPhotographerSetting("highlightsDriveFolderId", "folder-1", OWNED_ID);
    expect(axiosAuth.put).toHaveBeenCalledWith("/settings/highlightsDriveFolderId", {
      value: "folder-1",
      portfolioId: OWNED_ID,
    });
  });

  test("reorder sends the photo array and portfolioId as a query param", async () => {
    await reorderPhotographerPhotos(
      "highlights",
      [{ _id: "p1" }, { _id: "p2", position: 4 }],
      OWNED_ID
    );
    expect(axiosAuth.put).toHaveBeenCalledWith(
      "/photo/highlights/reorder",
      [
        { _id: "p1", position: 0 },
        { _id: "p2", position: 4 },
      ],
      { params: { portfolioId: OWNED_ID } }
    );
  });

  test("delete sends portfolioId as a query param", async () => {
    await deletePhotographerPhoto("highlights", "p1", OWNED_ID);
    expect(axiosAuth.delete).toHaveBeenCalledWith("/photo/highlights/p1", {
      params: { portfolioId: OWNED_ID },
    });
  });
});
