import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RedocStandalone } from "redoc";
import { DEFAULT_BACKEND_API, resolveBackendApi } from "@/config/backendApi";
import { formatMcpToolsList, publicOpenApiUrl } from "../developerApi";
import { preparePublicApiSpec, REDOC_OPTIONS } from "./specDocument";
import "./apiReference.css";

function apiPublicBase() {
  const origin = resolveBackendApi().replace(/\/$/, "") || DEFAULT_BACKEND_API;
  return `${origin}/api/public/v1`;
}

export default function ApiReferencePage() {
  const specUrl = publicOpenApiUrl();
  const [spec, setSpec] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(specUrl, { credentials: "omit" });
        if (!response.ok) throw new Error("spec unavailable");
        const body = await response.json();
        const origin = resolveBackendApi().replace(/\/$/, "");
        const prepared = preparePublicApiSpec(body, origin);
        if (!cancelled) setSpec(prepared);
      } catch {
        if (!cancelled) setError("The OpenAPI document could not be loaded from the API host.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [specUrl]);

  return (
    <div className="fvm-api-reference text-left">
      <section className="fvm-api-reference__intro border-b border-gray-200 bg-white px-4 md:px-8 py-6">
        <h1 className="text-2xl font-semibold text-slate-800">API reference</h1>
        <p className="text-sm text-slate-600 mt-3 max-w-4xl leading-relaxed">
          OpenAPI 3.1 for the FindVirtual.me public API. HTTPS base URL{" "}
          <code className="font-mono text-xs bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded">
            {apiPublicBase()}
          </code>
          . Authenticate with{" "}
          <code className="font-mono text-xs bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded">
            Authorization: Bearer fvm_YOUR_KEY
          </code>
          . Create and rotate keys in the{" "}
          <Link className="text-blue-700 underline" to="/developer">
            API Keys
          </Link>{" "}
          dashboard. Scopes include{" "}
          <code className="font-mono text-xs bg-slate-100 px-1 rounded">sites:write</code> for draft
          component edits. Streamable MCP tools are on{" "}
          <Link className="text-blue-700 underline" to="/developers/mcp">
            /developers/mcp
          </Link>{" "}
          ({formatMcpToolsList()}).
        </p>
        {error ? <p className="text-sm text-red-600 mt-3">{error}</p> : null}
      </section>

      <div className="fvm-api-reference__redoc">
        {spec ? (
          <RedocStandalone
            spec={spec}
            specUrl={specUrl}
            basePath="/developers/docs"
            options={{
              ...REDOC_OPTIONS,
              downloadUrls: specUrl ? [{ title: "OpenAPI 3.1 JSON", url: specUrl }] : [],
            }}
            logo={{
              url: "/fv-mark.svg",
              altText: "FindVirtual.me",
              href: "/developers/docs",
              backgroundColor: "#f8fafc",
            }}
          />
        ) : (
          <p className="px-4 py-10 text-sm text-slate-500">Loading the reference…</p>
        )}
      </div>
    </div>
  );
}