import {
  clampQrSize,
  resolveQrEncodeTarget,
  sanitizeHttpHref,
} from "../featureUrlUtils";

describe("featureUrlUtils", () => {
  it("sanitizeHttpHref allows http(s) and rejects javascript", () => {
    expect(sanitizeHttpHref("https://example.test/a")).toBe("https://example.test/a");
    expect(sanitizeHttpHref("javascript:alert(1)")).toBeNull();
    expect(sanitizeHttpHref("//evil.test")).toBeNull();
  });

  it("resolveQrEncodeTarget uses site URL when target empty", () => {
    const value = resolveQrEncodeTarget("", () => "https://site.test/view/abc");
    expect(value).toBe("https://site.test/view/abc");
  });

  it("resolveQrEncodeTarget rejects dangerous absolute targets", () => {
    expect(resolveQrEncodeTarget("javascript:alert(1)", () => "https://site.test")).toBe("");
    expect(resolveQrEncodeTarget("data:text/plain,hi", () => "https://site.test")).toBe("");
  });

  it("resolveQrEncodeTarget resolves same-site paths against window origin", () => {
    expect(resolveQrEncodeTarget("/welcome", () => "https://site.test/p/1")).toBe(
      `${window.location.origin}/welcome`
    );
  });

  it("clampQrSize keeps values within 64–512", () => {
    expect(clampQrSize(32)).toBe(64);
    expect(clampQrSize(900)).toBe(512);
    expect(clampQrSize(180)).toBe(180);
  });
});