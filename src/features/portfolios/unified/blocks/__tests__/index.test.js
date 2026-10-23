import BLOCK_COMPONENTS from "../index";

describe("BLOCK_COMPONENTS", () => {
  it("maps every key to a function component", () => {
    Object.entries(BLOCK_COMPONENTS).forEach(([key, C]) => {
      expect(typeof C).toBe("function");
      expect(key.length).toBeGreaterThan(0);
    });
  });

  it("includes core block types", () => {
    expect(BLOCK_COMPONENTS.hero).toBeDefined();
    expect(BLOCK_COMPONENTS.summary).toBeDefined();
    expect(BLOCK_COMPONENTS.contact).toBeDefined();
  });
});
