import { safeReturnPath, consumePostLoginPath } from "../safeReturnPath";

describe("safeReturnPath", () => {
  test("accepts same-origin relative paths", () => {
    expect(safeReturnPath("/dashboard")).toBe("/dashboard");
    expect(safeReturnPath("/portfolios/view/abc")).toBe("/portfolios/view/abc");
    expect(safeReturnPath("/profile?tab=settings")).toBe("/profile?tab=settings");
  });

  test("rejects protocol-relative paths", () => {
    expect(safeReturnPath("//evil.example")).toBeNull();
    expect(safeReturnPath("/%2F%2Fevil.example")).toBeNull();
  });

  test("rejects backslash open redirects", () => {
    expect(safeReturnPath("/\\evil.example")).toBeNull();
    expect(safeReturnPath("/foo\\bar")).toBeNull();
  });

  test("rejects absolute URLs and non-strings", () => {
    expect(safeReturnPath("https://evil.example/path")).toBeNull();
    expect(safeReturnPath(null)).toBeNull();
    expect(safeReturnPath("")).toBeNull();
    expect(safeReturnPath("dashboard")).toBeNull();
  });

  test("rejects paths with whitespace", () => {
    expect(safeReturnPath("/foo bar")).toBeNull();
  });
});

describe("consumePostLoginPath", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test("returns /profile when nothing stored", () => {
    expect(consumePostLoginPath()).toBe("/profile");
  });

  test("returns stored safe path and clears session", () => {
    sessionStorage.setItem(
      "postLoginPath",
      JSON.stringify({ path: "/dashboard", exp: Date.now() + 60_000 })
    );
    expect(consumePostLoginPath()).toBe("/dashboard");
    expect(sessionStorage.getItem("postLoginPath")).toBeNull();
  });

  test("falls back to /profile when stored path is unsafe", () => {
    sessionStorage.setItem(
      "postLoginPath",
      JSON.stringify({ path: "//evil.example", exp: Date.now() + 60_000 })
    );
    expect(consumePostLoginPath()).toBe("/profile");
  });
});