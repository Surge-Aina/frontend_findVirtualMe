import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { RedocStandalone } from "redoc";
import FvMark from "@/shared/components/FvMark";
import CopyBlock from "./CopyBlock";
import MermaidFigure from "./MermaidFigure";
import TryItPanel from "./TryItPanel";
import { mcpEndpointUrl, publicOpenApiUrl } from "../developerApi";
import {
  MCP_DIAGRAM,
  OAUTH_DIAGRAM,
  REDOC_OPTIONS,
  WEBHOOK_DIAGRAM,
  agentTargets,
  ensureLeadLookup,
  llmBrief,
  mcpConfigs,
  withAbsoluteServer,
} from "./specDocument";

function backendOrigin() {
  return String(import.meta.env.VITE_BACKEND_API || "").replace(/\/$/, "");
}

export default function ApiReferencePage() {
  const specUrl = publicOpenApiUrl();
  const docsUrl = `${window.location.origin}/developers/docs`;
  const [spec, setSpec] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(specUrl, { credentials: "omit" });
        if (!response.ok) throw new Error("spec unavailable");
        const body = await response.json();
        const prepared = withAbsoluteServer(ensureLeadLookup(body), backendOrigin());
        if (!cancelled) setSpec(prepared);
      } catch {
        if (!cancelled) setError("The OpenAPI document could not be loaded from the API host.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [specUrl]);

  const brief = useMemo(
    () =>
      llmBrief({
        spec,
        docsUrl,
        specUrl,
        mcpUrl: mcpEndpointUrl(),
      }),
    [spec, docsUrl, specUrl]
  );
  const targets = agentTargets(
    `Read the FindVirtualMe API reference at ${docsUrl} and the OpenAPI document at ${specUrl}. Explain bearer API keys, webhooks, and the MCP server at ${mcpEndpointUrl()}.`
  );

  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="bg-slate-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <FvMark />
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">API reference</h1>
              <p className="text-sm text-slate-500">FindVirtual.me public API</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100" href="#try">
              Try it
            </a>
            <a className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100" href="#agents">
              Agents
            </a>
            <a className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100" href="/llms.txt">
              llms.txt
            </a>
            <Link className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100" to="/developer">
              API keys
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <section id="agents" className="bg-white rounded-2xl shadow border border-gray-200 p-8 space-y-4">
          <h2 className="text-xl font-semibold text-slate-800">Use this reference with an agent</h2>
          <p className="text-sm text-slate-600">
            Redoc Community Edition renders the reference and, on each operation, Copy for LLM plus Open in Claude and
            Open in ChatGPT. Telemetry is turned off. It does not draw Mermaid diagrams or connect an MCP server, so
            those live on this page. A short description for other agents is at{" "}
            <a className="text-blue-700 underline" href="/llms.txt">
              /llms.txt
            </a>
            . The description does not include your API key. Gemini opens in Google AI Mode because the Gemini app does
            not accept a prompt in the URL. Copilot may show the prompt as a heading.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyBrief}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              {copied ? "Copied" : "Copy for LLM"}
            </button>
            {targets.map((target) => (
              <a
                key={target.name}
                href={target.href}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Open in {target.name}
              </a>
            ))}
          </div>
          <h3 className="text-lg font-semibold text-slate-800 pt-2">Connect the MCP server</h3>
          <p className="text-sm text-slate-600">
            The server is streamable HTTP at <span className="font-mono">{mcpEndpointUrl()}</span>. Each sample uses
            the placeholder <span className="font-mono">fvm_YOUR_KEY</span>. Replace it locally and do not commit a
            real key. Claude Code needs <span className="font-mono">type: http</span>. ChatGPT&apos;s plugin screen
            takes the server URL; the JSON sample is the Responses API tool, which can send a bearer token. Grok reads{" "}
            <span className="font-mono">~/.grok/config.toml</span>.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mcpConfigs(mcpEndpointUrl()).map((config) => (
              <CopyBlock key={config.id} label={`${config.label} · ${config.file}`} text={config.text} />
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <MermaidFigure title="OAuth install" chart={OAUTH_DIAGRAM} />
          <MermaidFigure title="Webhook delivery" chart={WEBHOOK_DIAGRAM} />
          <MermaidFigure title="MCP connection" chart={MCP_DIAGRAM} />
        </section>

        <section id="try" className="bg-white rounded-2xl shadow border border-gray-200 p-8 space-y-4">
          <h2 className="text-xl font-semibold text-slate-800">Try it</h2>
          <p className="text-sm text-slate-600">
            redoc 3.0.1 does not include try-it. Replay, the mock server, and Connect MCP are outside the MIT
            Community Edition. This panel calls only the configured FindVirtualMe API host. A production base must be
            https, and another host in the OpenAPI document is ignored. The key stays in memory for this page, is sent
            only as a bearer header, and is not stored or logged.
          </p>
          {spec ? <TryItPanel spec={spec} /> : <p className="text-sm text-slate-500">Loading the document...</p>}
        </section>
      </div>

      <section id="reference" className="border-t border-gray-200 bg-white">
        {spec ? (
          <RedocStandalone
            spec={spec}
            specUrl={specUrl}
            basePath="/developers/docs"
            options={{
              ...REDOC_OPTIONS,
              downloadUrls: specUrl ? [{ title: "OpenAPI document", url: specUrl }] : [],
            }}
            logo={{ url: "/fv-mark.svg", altText: "FindVirtual.me", href: "/developers", backgroundColor: "#f8fafc" }}
          />
        ) : (
          <p className="max-w-6xl mx-auto px-4 py-10 text-sm text-slate-500">Loading the reference...</p>
        )}
      </section>
    </div>
  );
}
