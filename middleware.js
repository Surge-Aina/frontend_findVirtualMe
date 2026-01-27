import { NextResponse } from "next/server";

// Files we never rewrite
const BYPASS_PREFIXES = [
  "/assets",
  "/favicon",
  "/@vite",
  "/@react-refresh",
  "/src",
  "/node_modules",
];

function shouldBypass(pathname) {
  return BYPASS_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function middleware(req) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host")?.toLowerCase();
  const pathname = url.pathname;

  if (!hostname || shouldBypass(pathname)) {
    return NextResponse.next();
  }

  const domain = hostname.replace(/^www\./, "");

  try {
    const apiBase = process.env.VERCEL_EDGE_API_ORIGIN;

    if (!apiBase) {
      console.error("Missing VERCEL_EDGE_API_ORIGIN");
      return NextResponse.next();
    }

    const res = await fetch(
      `${apiBase}/domainRouter/resolve?host=${domain}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return NextResponse.next();
    }

    const data = await res.json();

    if (!data.mapped) {
      return NextResponse.next();
    }

    const rewriteUrl = url.clone();
    rewriteUrl.pathname = `/portfolios/${data.portfolioType}/${data.portfolioId}`;

    return NextResponse.rewrite(rewriteUrl);
  } catch (err) {
    console.error("Edge middleware error:", err);
    return NextResponse.next();
  }
}
