import { MCP_ACCEPT_HEADER, formatMcpToolsList } from "../developerApi";
import { resolveBackendApi } from "@/config/backendApi";
import { buildLlmsTxt } from "@/config/llmsTxtContent";

const LEAD_PATH = "/leads/{leadId}";
const METHODS = ["get", "post", "put", "patch", "delete"];
const MONO =
  "'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export const REDOC_OPTIONS = {
  disableTelemetry: true,
  pathInMiddlePanel: true,
  requiredPropsFirst: true,
  sortRequiredPropsFirst: true,
  scrollYOffset: () => 80,
  expandResponses: "200,201",
  jsonSampleExpandLevel: 2,
  hideHostname: false,
  sortTagsAlphabetically: false,
  menuToggle: true,
  codeSamples: {
    languages: [
      { lang: "curl", label: "cURL", key: "curl" },
      { lang: "JavaScript", label: "JavaScript", key: "javascript" },
      { lang: "Python", label: "Python", key: "python" },
    ],
  },
  theme: {
    colors: {
      primary: { main: "#16a34a" },
      accent: { main: "#2563eb" },
      text: { primary: "#1e293b", secondary: "#475569" },
      http: {
        get: "#2563eb",
        post: "#15803d",
        put: "#a16207",
        delete: "#b91c1c",
        patch: "#7c3aed",
      },
    },
    sidebar: {
      backgroundColor: "#f8fafc",
      textColor: "#334155",
      activeTextColor: "#15803d",
    },
    typography: {
      fontFamily: MONO,
      headings: { fontFamily: MONO },
      code: { fontFamily: MONO },
    },
    rightPanel: { backgroundColor: "#0f172a", textColor: "#e2e8f0" },
    codeBlock: { backgroundColor: "#0f172a" },
  },
};

function cloneSpec(spec) {
  return JSON.parse(JSON.stringify(spec));
}

export function ensureLeadLookup(spec) {
  const next = spec && typeof spec === "object" ? cloneSpec(spec) : { openapi: "3.1.0", paths: {} };
  if (!next.paths || typeof next.paths !== "object") next.paths = {};
  if (next.paths[LEAD_PATH]?.get) return next;
  const tags = Array.isArray(next.tags) ? next.tags : [];
  if (!tags.some((tag) => tag?.name === "Leads")) {
    tags.push({
      name: "Leads",
      description: "Captured leads for sites this key can read.",
    });
  }
  next.tags = tags;
  next.paths[LEAD_PATH] = {
    get: {
      tags: ["Leads"],
      operationId: "getLead",
      summary: "Look up a captured lead",
      description:
        "Read one captured lead for a site this key can access. Requires leads:read. Fields match the lead.captured event data. The published OpenAPI document does not list this operation yet, so the reference adds it.",
      parameters: [
        {
          name: "leadId",
          in: "path",
          required: true,
          description: "Identifier of the captured lead.",
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "The captured lead",
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["data"],
                properties: {
                  data: {
                    type: "object",
                    required: ["id", "siteId", "createdAt"],
                    properties: {
                      id: { type: "string" },
                      siteId: { type: "string" },
                      email: { type: "string" },
                      name: { type: ["string", "null"] },
                      phone: { type: ["string", "null"] },
                      createdAt: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Missing or invalid API key" },
        403: { description: "Missing leads:read" },
        404: { description: "Lead not found" },
      },
    },
  };
  return next;
}

export function configuredApiOrigin() {
  const raw = resolveBackendApi().replace(/\/$/, "");
  if (!raw) return "";
  try {
    return new URL(raw).origin;
  } catch {
    return "";
  }
}

export function withAbsoluteServer(spec, origin) {
  const next = spec && typeof spec === "object" ? cloneSpec(spec) : { paths: {} };
  const base = String(origin || "").replace(/\/$/, "");
  let baseUrl = null;
  try {
    if (base) baseUrl = new URL(base);
  } catch {
    baseUrl = null;
  }
  const servers = Array.isArray(next.servers) && next.servers.length ? next.servers : [{ url: "/api/public/v1" }];
  next.servers = servers.map((server) => {
    const url = typeof server?.url === "string" && server.url ? server.url : "/api/public/v1";
    let path = "/api/public/v1";
    if (/^https?:\/\//i.test(url)) {
      try {
        const parsed = new URL(url);
        if (baseUrl && parsed.origin === baseUrl.origin) {
          path = parsed.pathname.replace(/\/$/, "") || "/api/public/v1";
        }
      } catch {
        path = "/api/public/v1";
      }
    } else if (url.startsWith("/") && !url.startsWith("//")) {
      path = url.replace(/\/$/, "") || "/api/public/v1";
    }
    return { ...server, url: baseUrl ? `${baseUrl.origin}${path}` : path };
  });
  return next;
}

function demoPathParam(name) {
  const lower = String(name).toLowerCase();
  if (lower === "leadid") return "lead_example";
  if (lower === "id") return "site_example";
  if (lower === "sectionid") return "section_example";
  if (lower.includes("webhook")) return "webhook_example";
  return "example";
}

function demoPath(path) {
  return String(path).replace(/\{([^}]+)\}/g, (_, name) => demoPathParam(name));
}

function operationNeedsAuth(operation) {
  if (!operation || typeof operation !== "object") return true;
  if (operation.security === null) return false;
  if (Array.isArray(operation.security) && operation.security.length === 0) return false;
  return true;
}

function buildOperationCodeSamples({ method, path, serverUrl, operation }) {
  const upper = method.toUpperCase();
  const relative = demoPath(path);
  const url = `${serverUrl}${relative}`;
  const authHeader = operationNeedsAuth(operation);
  const hasBody = upper !== "GET" && upper !== "HEAD" && Boolean(operation?.requestBody);

  const curlLines = [`curl -X ${upper} "${url}" \\`, `  -H "Accept: application/json" \\`];
  if (authHeader) {
    curlLines.push(`  -H "Authorization: Bearer fvm_YOUR_KEY" \\`);
  }
  if (hasBody) {
    curlLines.push(`  -H "Content-Type: application/json" \\`);
    curlLines.push(`  -d '{}'`);
  } else {
    curlLines[curlLines.length - 1] = curlLines[curlLines.length - 1].replace(/ \\$/, "");
  }
  const curl = curlLines.join("\n");

  const javascript = `const response = await fetch("${url}", {
  method: "${upper}",
  headers: {
    Accept: "application/json",${
      authHeader ? '\n    Authorization: "Bearer fvm_YOUR_KEY",' : ""
    }
  }${hasBody ? ",\n  body: JSON.stringify({})" : ""}
});
const data = await response.json();`;

  const python = hasBody
    ? `import urllib.request

req = urllib.request.Request(
    "${url}",
    data=b"{}",
    headers={
        "Accept": "application/json",
        "Content-Type": "application/json",${
          authHeader ? '\n        "Authorization": "Bearer fvm_YOUR_KEY",' : ""
        }
    },
    method="${upper}",
)
with urllib.request.urlopen(req) as resp:
    print(resp.read().decode())`
    : `import urllib.request

req = urllib.request.Request(
    "${url}",
    headers={
        "Accept": "application/json",${
          authHeader ? '\n        "Authorization": "Bearer fvm_YOUR_KEY",' : ""
        }
    },
)
with urllib.request.urlopen(req) as resp:
    print(resp.read().decode())`;

  return [
    { lang: "curl", label: "cURL", source: curl },
    { lang: "JavaScript", label: "JavaScript", source: javascript },
    { lang: "Python", label: "Python", source: python },
  ];
}

export function injectCodeSamples(spec, serverUrl) {
  const next = spec && typeof spec === "object" ? cloneSpec(spec) : { paths: {} };
  const base = String(serverUrl || "").replace(/\/$/, "");
  const paths = next.paths && typeof next.paths === "object" ? next.paths : {};
  for (const path of Object.keys(paths)) {
    const item = paths[path] || {};
    for (const method of METHODS) {
      const operation = item[method];
      if (!operation || typeof operation !== "object") continue;
      if (Array.isArray(operation["x-codeSamples"]) && operation["x-codeSamples"].length) continue;
      operation["x-codeSamples"] = buildOperationCodeSamples({ method, path, serverUrl: base, operation });
    }
  }
  return next;
}

export function polishSpecForRedoc(spec) {
  const next = spec && typeof spec === "object" ? cloneSpec(spec) : {};
  if (next.info && typeof next.info === "object") {
    next.info.title = "FindVirtual.me Public API";
    const description = String(next.info.description || "");
    next.info.description = description.replace(/Human docs:\s*\/api\/public\/docs\.?/i, "").trim();
  }
  if (Array.isArray(next.servers)) {
    next.servers = next.servers.map((server) => ({
      ...server,
      description: "Public API v1 (Railway production host)",
    }));
  }
  if (next.webhooks && typeof next.webhooks === "object") {
    for (const key of Object.keys(next.webhooks)) {
      const hook = next.webhooks[key];
      if (!hook?.post || typeof hook.post !== "object") continue;
      if (!Array.isArray(hook.post.tags) || !hook.post.tags.length) {
        hook.post.tags = ["Webhooks"];
      }
      hook.post["x-displayName"] = hook.post["x-displayName"] || key;
    }
  }
  return next;
}

export function preparePublicApiSpec(spec, origin) {
  const absolute = withAbsoluteServer(ensureLeadLookup(spec), origin);
  const serverUrl = serverUrlOf(absolute);
  return injectCodeSamples(polishSpecForRedoc(absolute), serverUrl);
}

export function serverUrlOf(spec) {
  const url = spec?.servers?.[0]?.url;
  return typeof url === "string" && url ? url.replace(/\/$/, "") : "/api/public/v1";
}

export function listOperations(spec) {
  const paths = spec?.paths && typeof spec.paths === "object" ? spec.paths : {};
  const rows = [];
  for (const path of Object.keys(paths)) {
    const item = paths[path] || {};
    for (const method of METHODS) {
      const operation = item[method];
      if (!operation || typeof operation !== "object") continue;
      rows.push({
        method: method.toUpperCase(),
        path,
        operationId: operation.operationId || `${method} ${path}`,
        summary: operation.summary || "",
        parameters: Array.isArray(operation.parameters) ? operation.parameters : [],
        bodyProperties: bodyPropertyNames(operation),
      });
    }
  }
  return rows;
}

function bodyPropertyNames(operation) {
  const schema = operation?.requestBody?.content?.["application/json"]?.schema;
  const properties = schema?.properties;
  if (!properties || typeof properties !== "object") return [];
  return Object.keys(properties);
}

export function joinApiUrl(serverUrl, path, pathParams, query) {
  let filled = path;
  for (const [name, value] of Object.entries(pathParams || {})) {
    filled = filled.replaceAll(`{${name}}`, encodeURIComponent(String(value ?? "")));
  }
  if (filled.includes("{")) {
    throw new Error("Fill every path parameter.");
  }
  const base = String(serverUrl || "").replace(/\/$/, "");
  const suffix = filled.startsWith("/") ? filled : `/${filled}`;
  const absolute = /^https?:\/\//i.test(base) ? `${base}${suffix}` : `${base}${suffix}`;
  const url = new URL(absolute, "http://localhost");
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https calls are allowed.");
  }
  if (/^https?:\/\//i.test(base) && url.origin !== new URL(base).origin) {
    throw new Error("API calls must stay on the FindVirtualMe API host.");
  }
  for (const [name, value] of Object.entries(query || {})) {
    if (value !== undefined && value !== "") url.searchParams.set(name, String(value));
  }
  if (/^https?:\/\//i.test(base)) return url.toString();
  return `${url.pathname}${url.search}`;
}

export function apiCallAllowed(url, { production = false, apiOrigin } = {}) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  const expected = apiOrigin === undefined ? configuredApiOrigin() : apiOrigin;
  if (!expected) return false;
  let allowedOrigin;
  try {
    allowedOrigin = new URL(expected).origin;
  } catch {
    return false;
  }
  if (parsed.origin !== allowedOrigin || parsed.username || parsed.password) return false;
  if (parsed.protocol === "https:") return true;
  if (production || parsed.protocol !== "http:") return false;
  return parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1" || parsed.hostname === "::1";
}

export function buildApiRequest({ serverUrl, method, path, pathParams, query, bodyText, apiKey, production = false }) {
  const url = joinApiUrl(serverUrl, path, pathParams, query);
  if (!apiCallAllowed(url, { production })) {
    throw new Error("API calls must use the FindVirtualMe API host over https.");
  }
  const headers = { Accept: "application/json" };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  const init = { method, headers, credentials: "omit" };
  if (bodyText && method !== "GET" && method !== "HEAD") {
    headers["Content-Type"] = "application/json";
    init.body = bodyText;
  }
  return { url, init };
}

export function readPath(value, path) {
  if (!path) return undefined;
  return path.split(".").reduce((current, key) => (current == null ? undefined : current[key]), value);
}

export function llmBrief({ spec, docsUrl, specUrl, mcpUrl }) {
  const operations = listOperations(spec)
    .map((operation) => `- ${operation.method} ${operation.path} — ${operation.summary || operation.operationId}`)
    .join("\n");
  return [
    "FindVirtualMe public API. Use this description. Do not invent endpoints.",
    `Reference: ${docsUrl}`,
    `OpenAPI: ${specUrl}`,
    "Auth: Authorization: Bearer fvm_YOUR_KEY. The key reads only its owner's data.",
    `MCP: POST ${mcpUrl} with the same bearer key. Tools: ${formatMcpToolsList()}. Component tools need sites:write.`,
    "Webhook signature: HMAC-SHA256 of timestamp + '.' + raw body, header X-FindVirtualMe-Signature: v1=<hex>. Reject timestamps older or newer than 300 seconds.",
    "Operations:",
    operations,
  ].join("\n");
}

export const OAUTH_DIAGRAM = `sequenceDiagram
  participant Customer
  participant App
  participant FV as FindVirtualMe
  Customer->>FV: Open an approved app from GET /api/marketplace/apps
  FV->>Customer: Choose a site and the requested scopes
  Customer->>FV: GET /api/oauth/authorize with PKCE S256
  FV->>App: Redirect to the app redirect URI with code and state
  App->>FV: POST /api/oauth/token grant_type=authorization_code
  FV-->>App: Access token limited to the granted scopes`;

export const WEBHOOK_DIAGRAM = `sequenceDiagram
  participant FV as FindVirtualMe
  participant Hook as Subscriber
  FV->>Hook: POST event JSON
  Note over FV,Hook: X-FindVirtualMe-Timestamp unix seconds
  Note over FV,Hook: X-FindVirtualMe-Signature v1=HMAC-SHA256
  Note over FV,Hook: X-FindVirtualMe-Event stable id
  Hook->>Hook: Reject if timestamp is outside 300 seconds
  Hook->>Hook: Compare HMAC of timestamp.rawBody in constant time
  Hook->>Hook: Dedupe on the event id
  FV->>Hook: Retry with a new timestamp on 5s, 30s, 2m, 10m, 1h`;

export const MCP_DIAGRAM = `sequenceDiagram
  participant Dev as Developer
  participant Client as Cursor, VS Code, or Claude
  participant MCP as POST /api/mcp
  Dev->>Client: Add findvirtualme with the API host and a bearer key
  Client->>MCP: Streamable HTTP request, Authorization Bearer
  MCP-->>Client: list_sites, get_site, list_site_components, add_site_component (sites:write)`;

const KEY_PLACEHOLDER = "fvm_YOUR_KEY";

export function mcpConfigs(endpoint) {
  const bearer = `Bearer ${KEY_PLACEHOLDER}`;
  const headers = `"Authorization": "${bearer}",
        "Accept": "${MCP_ACCEPT_HEADER}"`;
  const cursor = `{
  "mcpServers": {
    "findvirtualme": {
      "url": "${endpoint}",
      "headers": {
        ${headers}
      }
    }
  }
}`;
  const claudeCode = `{
  "mcpServers": {
    "findvirtualme": {
      "type": "http",
      "url": "${endpoint}",
      "headers": {
        ${headers}
      }
    }
  }
}`;
  const vscode = `{
  "servers": {
    "findvirtualme": {
      "type": "http",
      "url": "${endpoint}",
      "headers": {
        ${headers}
      }
    }
  }
}`;
  const chatgpt = `{
  "type": "mcp",
  "server_label": "findvirtualme",
  "server_url": "${endpoint}",
  "authorization": "${bearer}",
  "headers": {
    "Accept": "${MCP_ACCEPT_HEADER}"
  }
}`;
  const gemini = `{
  "mcpServers": {
    "findvirtualme": {
      "httpUrl": "${endpoint}",
      "headers": {
        ${headers}
      }
    }
  }
}`;
  const grok = `[mcp_servers.findvirtualme]
url = "${endpoint}"
headers = { Authorization = "${bearer}", Accept = "${MCP_ACCEPT_HEADER}" }`;
  const copilot = `{
  "mcpServers": {
    "findvirtualme": {
      "type": "http",
      "url": "${endpoint}",
      "headers": {
        ${headers}
      }
    }
  }
}`;
  return [
    { id: "cursor", label: "Cursor", file: ".cursor/mcp.json", text: cursor },
    { id: "vscode", label: "VS Code", file: ".vscode/mcp.json", text: vscode },
    { id: "claude-desktop", label: "Claude Desktop", file: "claude_desktop_config.json", text: cursor },
    { id: "claude-code", label: "Claude Code", file: ".mcp.json", text: claudeCode },
    { id: "chatgpt", label: "ChatGPT", file: "Responses API mcp tool", text: chatgpt },
    { id: "gemini", label: "Gemini", file: "~/.gemini/settings.json", text: gemini },
    { id: "grok", label: "Grok", file: "~/.grok/config.toml", text: grok },
    { id: "copilot", label: "Copilot", file: "~/.copilot/mcp-config.json", text: copilot },
  ];
}

export function llmsTxt(apiHost = resolveBackendApi()) {
  return buildLlmsTxt(apiHost);
}

export function agentTargets(prompt) {
  const q = encodeURIComponent(prompt);
  const flat = encodeURIComponent(prompt.replace(/[ \t]*\n+[ \t]*/g, " ").trim());
  return [
    { name: "Claude", href: `https://claude.ai/new?q=${q}` },
    { name: "ChatGPT", href: `https://chatgpt.com/?q=${q}` },
    { name: "Gemini", href: `https://www.google.com/search?udm=50&q=${flat}` },
    { name: "Grok", href: `https://grok.com/?q=${q}` },
    { name: "Copilot", href: `https://copilot.microsoft.com/?q=${flat}` },
  ];
}

export const SETUP_FLOW = {
  id: "subscribe",
  title: "List sites, subscribe a webhook, send a test",
  steps: [
    {
      id: "sites",
      method: "GET",
      path: "/sites",
      summary: "List sites for this key",
    },
    {
      id: "subscribe",
      method: "POST",
      path: "/webhooks",
      summary: "Subscribe to lead.captured",
      bodyText: JSON.stringify(
        { url: "https://hooks.example.test/events", events: ["lead.captured"] },
        null,
        2
      ),
      save: { webhookId: "data.id" },
    },
    {
      id: "test",
      method: "POST",
      path: "/webhooks/{webhookId}/test",
      summary: "Send one signed test event",
    },
  ],
};
