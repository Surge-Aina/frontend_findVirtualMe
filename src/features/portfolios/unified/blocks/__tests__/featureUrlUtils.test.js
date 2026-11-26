import {
  clampQrSize,
  resolveQrEncodeTarget,
  sanitizeHttpHref,
  validateSameSitePath,
} from "../featureUrlUtils";

describe("featureUrlUtils", () => {
  it("sanitizeHttpHref normalizes uppercase HTTPS scheme", () => {
    expect(sanitizeHttpHref("HTTPS://EXAMPLE.TEST/a")).toBe("https://example.test/a");
  });

  it("sanitizeHttpHref rejects non-http(s) schemes and protocol-relative URLs", () => {
    expect(sanitizeHttpHref("ftp://files.example.test/a")).toBeNull();
    expect(sanitizeHttpHref("//evil.test")).toBeNull();
    expect(sanitizeHttpHref("javascript:alert(1)")).toBeNull();
  });

  it("sanitizeHttpHref rejects host-less https URLs", () => {
    expect(sanitizeHttpHref("https://")).toBeNull();
  });

  it("sanitizeHttpHref prepends https only for scheme-less hosts", () => {
    expect(sanitizeHttpHref("example.test/page")).toBe("https://example.test/page");
    expect(sanitizeHttpHref("/relative-only")).toBeNull();
  });

  it("validateSameSitePath rejects dot-segment paths", () => {
    expect(validateSameSitePath("/a/../b")).toBe(false);
    expect(validateSameSitePath("/welcome")).toBe(true);
  });

  it("resolveQrEncodeTarget uses site URL when target empty", () => {
    const value = resolveQrEncodeTarget("", () => "https://site.test/view/abc");
    expect(value).toBe("https://site.test/view/abc");
  });

  it("resolveQrEncodeTarget rejects dangerous absolute targets", () => {
    expect(resolveQrEncodeTarget("javascript:alert(1)", () => "https://site.test")).toBe("");
    expect(resolveQrEncodeTarget("ftp://bad.example", () => "https://site.test")).toBe("");
    expect(resolveQrEncodeTarget("data:text/plain,hi", () => "https://site.test")).toBe("");
  });

  it("resolveQrEncodeTarget rejects invalid same-site paths", () => {
    expect(resolveQrEncodeTarget("/a/../b", () => "https://site.test/p/1")).toBe("");
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