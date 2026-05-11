const mockAxiosGet = jest.fn();
const mockAxiosPost = jest.fn();
const mockAuthGet = jest.fn();
const mockAuthPost = jest.fn();
const mockAuthPatch = jest.fn();
const mockAuthDelete = jest.fn();

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: (...args) => mockAxiosGet(...args),
    post: (...args) => mockAxiosPost(...args),
  },
}));

jest.mock("../axiosAuth", () => ({
  __esModule: true,
  default: {
    get: (...args) => mockAuthGet(...args),
    post: (...args) => mockAuthPost(...args),
    patch: (...args) => mockAuthPatch(...args),
    delete: (...args) => mockAuthDelete(...args),
  },
}));

describe("portfolioApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getById calls authenticated GET", async () => {
    const { portfolioApi } = await import("../portfolioApi");
    portfolioApi.getById("abc");
    expect(mockAuthGet).toHaveBeenCalledWith("/api/portfolios/abc", undefined);
  });

  it("getBySlug calls authenticated GET with slug path", async () => {
    const { portfolioApi } = await import("../portfolioApi");
    portfolioApi.getBySlug("my-slug");
    expect(mockAuthGet).toHaveBeenCalledWith("/api/portfolios/slug/my-slug", undefined);
  });

  it("listPublic uses public axios GET with optional template", async () => {
    const { portfolioApi } = await import("../portfolioApi");
    portfolioApi.listPublic("handyman");
    expect(mockAxiosGet).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/portfolios\/public\/list\?template=handyman$/)
    );

    mockAxiosGet.mockClear();
    portfolioApi.listPublic();
    expect(mockAxiosGet).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/portfolios\/public\/list$/)
    );
  });

  it("getBlockTypes builds query string for template and mode", async () => {
    const { portfolioApi } = await import("../portfolioApi");
    portfolioApi.getBlockTypes("agent", { mode: "edit" });
    expect(mockAxiosGet).toHaveBeenCalledWith(
      expect.stringMatching(
        /\/api\/portfolios\/block-types\?template=agent&mode=edit$/
      )
    );
  });

  it("create posts template and data", async () => {
    const { portfolioApi } = await import("../portfolioApi");
    portfolioApi.create("projectManager", { title: "Hi" });
    expect(mockAuthPost).toHaveBeenCalledWith("/api/portfolios", {
      template: "projectManager",
      title: "Hi",
    });
  });

  it("updateSection patches nested section path", async () => {
    const { portfolioApi } = await import("../portfolioApi");
    portfolioApi.updateSection("p1", "s1", { foo: 1 });
    expect(mockAuthPatch).toHaveBeenCalledWith("/api/portfolios/p1/sections/s1", {
      data: { foo: 1 },
    });
  });

  it("reorderSections sends orderedIds", async () => {
    const { portfolioApi } = await import("../portfolioApi");
    portfolioApi.reorderSections("p1", ["a", "b"]);
    expect(mockAuthPatch).toHaveBeenCalledWith("/api/portfolios/p1/reorder", {
      orderedIds: ["a", "b"],
    });
  });

  it("delete removes portfolio by id", async () => {
    const { portfolioApi } = await import("../portfolioApi");
    portfolioApi.delete("x");
    expect(mockAuthDelete).toHaveBeenCalledWith("/api/portfolios/x");
  });
});
