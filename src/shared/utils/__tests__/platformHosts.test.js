import {
  classifyHost,
  isFindVirtualPortfolioSubdomain,
  isPlatformHost,
} from "../platformHosts.js";

describe("host classification", () => {
  test("classifies the apex as a platform host", () => {
    expect(classifyHost("findvirtual.me")).toBe("platform");
    expect(isPlatformHost("FINDVIRTUAL.ME")).toBe(true);
  });

  test("classifies www.findvirtual.me as a platform host", () => {
    expect(classifyHost("www.findvirtual.me")).toBe("platform");
    expect(isFindVirtualPortfolioSubdomain("www.findvirtual.me")).toBe(false);
  });

  test("classifies vercel.app preview hosts as platform hosts", () => {
    expect(classifyHost("frontend-git-main-team.vercel.app")).toBe("platform");
    expect(classifyHost("vercel.app")).toBe("custom-domain");
  });

  test("classifies a slug subdomain as portfolio routing", () => {
    expect(classifyHost("acme.findvirtual.me")).toBe("portfolio-subdomain");
    expect(isPlatformHost("acme.findvirtual.me")).toBe(false);
  });

  test("classifies a mapped custom domain separately from platform hosts", () => {
    expect(classifyHost("shop.example.com")).toBe("custom-domain");
    expect(isPlatformHost("shop.example.com")).toBe(false);
  });

  test("does not treat an unmapped custom domain as a platform host", () => {
    expect(classifyHost("unknown.custom.test")).toBe("custom-domain");
    expect(isFindVirtualPortfolioSubdomain("unknown.custom.test")).toBe(false);
  });

  test("drops staging.findvirtual.me and treats it as a portfolio subdomain", () => {
    expect(classifyHost("staging.findvirtual.me")).toBe("portfolio-subdomain");
  });

  test("classifies localhost and 127.0.0.1 as platform hosts", () => {
    expect(classifyHost("localhost")).toBe("platform");
    expect(classifyHost("127.0.0.1")).toBe("platform");
  });

  test("VITE_PLATFORM_HOSTS adds comma-separated hosts without dropping defaults", () => {
    const env = " preview.internal.test , *.preview.example.com ";
    expect(isPlatformHost("preview.internal.test", env)).toBe(true);
    expect(isPlatformHost("branch.preview.example.com", env)).toBe(true);
    expect(isPlatformHost("www.findvirtual.me", env)).toBe(true);
    expect(isPlatformHost("findvirtual.me", env)).toBe(true);
    expect(classifyHost("notes.findvirtual.me", env)).toBe("portfolio-subdomain");
  });
});
