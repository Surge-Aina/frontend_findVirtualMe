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

describe("photographer portfolio writes", () => {
  beforeEach(() => {
    axiosAuth.put.mockReset();
    axiosAuth.delete.mockReset();
  });

  test("uses an owned photographer portfolio id ahead of the legacy default", () => {
    const id = resolvePhotographerPortfolioId("default", {
      portfolios: [{ portfolioId: "abc123", portfolioType: "photographer" }],
    });
    expect(id).toBe("abc123");
  });

  test("keeps a concrete context id", () => {
    expect(resolvePhotographerPortfolioId("owned-id", null)).toBe("owned-id");
  });

  test("settings include portfolioId in the body", async () => {
    await putPhotographerSetting("highlightsDriveFolderId", "folder-1", "owned-id");
    expect(axiosAuth.put).toHaveBeenCalledWith("/settings/highlightsDriveFolderId", {
      value: "folder-1",
      portfolioId: "owned-id",
    });
  });

  test("reorder sends the photo array and portfolioId as a query param", async () => {
    await reorderPhotographerPhotos(
      "highlights",
      [{ _id: "p1" }, { _id: "p2", position: 4 }],
      "owned-id"
    );
    expect(axiosAuth.put).toHaveBeenCalledWith(
      "/photo/highlights/reorder",
      [
        { _id: "p1", position: 0 },
        { _id: "p2", position: 4 },
      ],
      { params: { portfolioId: "owned-id" } }
    );
  });

  test("delete sends portfolioId as a query param", async () => {
    await deletePhotographerPhoto("highlights", "p1", "owned-id");
    expect(axiosAuth.delete).toHaveBeenCalledWith("/photo/highlights/p1", {
      params: { portfolioId: "owned-id" },
    });
  });
});
